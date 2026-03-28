import { Router, type IRouter } from "express";
import { db, servicesTable, ordersTable } from "@workspace/db";
import { eq, count, sum } from "drizzle-orm";
import { z } from "zod";
import { generateAdminToken, getAdminCredentials, requireAdmin } from "../middlewares/auth";
import crypto from "crypto";

const router: IRouter = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: "Username and password required" });
    }
    const { username, password } = parsed.data;
    const creds = getAdminCredentials();

    if (username !== creds.username || password !== creds.password) {
      await new Promise((r) => setTimeout(r, 500));
      return void res.status(401).json({ error: "unauthorized", message: "Invalid username or password" });
    }

    const token = generateAdminToken(username);
    res.json({ token, username });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [totalServices] = await db.select({ count: count() }).from(servicesTable);
    const [totalOrders] = await db.select({ count: count() }).from(ordersTable);
    const [revenueResult] = await db.select({ total: sum(ordersTable.total) }).from(ordersTable);
    const [pendingOrders] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
    const [featuredServices] = await db.select({ count: count() }).from(servicesTable).where(eq(servicesTable.featured, true));

    res.json({
      totalServices: totalServices?.count ?? 0,
      totalOrders: totalOrders?.count ?? 0,
      totalRevenue: parseFloat(revenueResult?.total ?? "0"),
      pendingOrders: pendingOrders?.count ?? 0,
      featuredServices: featuredServices?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "internal_error", message: "Failed to get stats" });
  }
});

export default router;
