import { Router, type IRouter } from "express";
import { db, servicesTable, ordersTable, loginLogsTable } from "@workspace/db";
import { eq, count, sum, desc, and } from "drizzle-orm";
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

function getClientIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return first?.trim() ?? null;
  }
  return req.ip ?? null;
}

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: "Username and password required" });
    }
    const { username, password } = parsed.data;
    const creds = getAdminCredentials();
    const ip = getClientIp(req);

    if (username !== creds.username || password !== creds.password) {
      await new Promise((r) => setTimeout(r, 500));
      await db.insert(loginLogsTable).values({ type: "admin", identifier: username, ipAddress: ip, success: false });
      return void res.status(401).json({ error: "unauthorized", message: "Invalid username or password" });
    }

    await db.insert(loginLogsTable).values({ type: "admin", identifier: username, ipAddress: ip, success: true });

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

router.get("/login-logs", requireAdmin, async (req, res) => {
  try {
    const typeFilter = req.query.type as string | undefined;
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
    const offset = (page - 1) * limit;

    const whereClause = typeFilter ? eq(loginLogsTable.type, typeFilter) : undefined;

    const [{ total }] = await db
      .select({ total: count() })
      .from(loginLogsTable)
      .where(whereClause);

    const logs = await db
      .select()
      .from(loginLogsTable)
      .where(whereClause)
      .orderBy(desc(loginLogsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      logs,
      total: total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((total ?? 0) / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get login logs");
    res.status(500).json({ error: "internal_error", message: "Failed to get login logs" });
  }
});

export default router;
