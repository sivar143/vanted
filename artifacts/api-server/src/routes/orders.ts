import { Router, type IRouter } from "express";
import { db, cartItemsTable, servicesTable, ordersTable, orderItemsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

const createOrderSchema = z.object({
  sessionId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  paymentMethod: z.enum(["credit_card", "debit_card", "paypal", "bank_transfer"]),
  cardNumber: z.string().nullable().optional(),
  cardExpiry: z.string().nullable().optional(),
  cardCvv: z.string().nullable().optional(),
});

async function getOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return { ...order, items };
}

router.post("/", async (req, res) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: parsed.error.message });
    }
    const { sessionId, customerName, customerEmail, paymentMethod } = parsed.data;

    const cartItems = await db
      .select({ id: cartItemsTable.id, serviceId: cartItemsTable.serviceId, quantity: cartItemsTable.quantity, service: servicesTable })
      .from(cartItemsTable)
      .innerJoin(servicesTable, eq(cartItemsTable.serviceId, servicesTable.id))
      .where(eq(cartItemsTable.sessionId, sessionId));

    if (cartItems.length === 0) {
      return void res.status(400).json({ error: "bad_request", message: "Cart is empty" });
    }

    const total = cartItems.reduce((sum, item) => sum + item.service.price * item.quantity, 0);

    const [order] = await db
      .insert(ordersTable)
      .values({
        sessionId,
        customerName,
        customerEmail,
        total: Math.round(total * 100) / 100,
        status: "processing",
        paymentStatus: "paid",
        paymentMethod,
      })
      .returning();

    await db.insert(orderItemsTable).values(
      cartItems.map((item) => ({
        orderId: order!.id,
        serviceId: item.serviceId,
        serviceName: item.service.name,
        price: item.service.price,
        quantity: item.quantity,
      }))
    );

    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

    const fullOrder = await getOrderWithItems(order!.id);
    res.status(201).json(fullOrder);
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "internal_error", message: "Failed to create order" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return void res.status(400).json({ error: "bad_request", message: "Invalid order ID" });

    const order = await getOrderWithItems(id);
    if (!order) return void res.status(404).json({ error: "not_found", message: "Order not found" });

    res.json(order);
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "internal_error", message: "Failed to get order" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
        return { ...order, items };
      })
    );
    res.json({ orders: ordersWithItems, total: orders.length });
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "internal_error", message: "Failed to list orders" });
  }
});

export default router;
