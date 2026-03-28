import { Router, type IRouter } from "express";
import { db, cartItemsTable, servicesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const addToCartSchema = z.object({
  sessionId: z.string().min(1),
  serviceId: z.number().int(),
  quantity: z.number().int().min(1).default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

async function buildCartResponse(sessionId: string) {
  const items = await db
    .select({
      id: cartItemsTable.id,
      sessionId: cartItemsTable.sessionId,
      serviceId: cartItemsTable.serviceId,
      quantity: cartItemsTable.quantity,
      service: servicesTable,
    })
    .from(cartItemsTable)
    .innerJoin(servicesTable, eq(cartItemsTable.serviceId, servicesTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const total = items.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, total: Math.round(total * 100) / 100, itemCount };
}

router.get("/", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) return void res.status(400).json({ error: "bad_request", message: "sessionId is required" });
    res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error({ err }, "Failed to get cart");
    res.status(500).json({ error: "internal_error", message: "Failed to get cart" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: parsed.error.message });
    }
    const { sessionId, serviceId, quantity } = parsed.data;

    const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId));
    if (!service) return void res.status(404).json({ error: "not_found", message: "Service not found" });

    const [existing] = await db
      .select()
      .from(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.serviceId, serviceId)));

    if (existing) {
      await db
        .update(cartItemsTable)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItemsTable.id, existing.id));
    } else {
      await db.insert(cartItemsTable).values({ sessionId, serviceId, quantity });
    }

    res.json(await buildCartResponse(sessionId));
  } catch (err) {
    req.log.error({ err }, "Failed to add to cart");
    res.status(500).json({ error: "internal_error", message: "Failed to add to cart" });
  }
});

router.put("/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) return void res.status(400).json({ error: "bad_request", message: "Invalid item ID" });

    const parsed = updateCartItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: parsed.error.message });
    }

    const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, itemId));
    if (!item) return void res.status(404).json({ error: "not_found", message: "Cart item not found" });

    const [updated] = await db
      .update(cartItemsTable)
      .set({ quantity: parsed.data.quantity })
      .where(eq(cartItemsTable.id, itemId))
      .returning();

    const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, updated!.serviceId));
    res.json({ ...updated, service });
  } catch (err) {
    req.log.error({ err }, "Failed to update cart item");
    res.status(500).json({ error: "internal_error", message: "Failed to update cart item" });
  }
});

router.delete("/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) return void res.status(400).json({ error: "bad_request", message: "Invalid item ID" });

    const [deleted] = await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId)).returning();
    if (!deleted) return void res.status(404).json({ error: "not_found", message: "Cart item not found" });

    res.json({ success: true, message: "Item removed" });
  } catch (err) {
    req.log.error({ err }, "Failed to remove cart item");
    res.status(500).json({ error: "internal_error", message: "Failed to remove cart item" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) return void res.status(400).json({ error: "bad_request", message: "sessionId is required" });
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    req.log.error({ err }, "Failed to clear cart");
    res.status(500).json({ error: "internal_error", message: "Failed to clear cart" });
  }
});

export default router;
