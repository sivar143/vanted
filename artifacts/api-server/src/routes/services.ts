import { Router, type IRouter } from "express";
import { db, servicesTable } from "@workspace/db";
import { eq, ilike, and, sql, count } from "drizzle-orm";
import { z } from "zod/v4";
import { insertServiceSchema, updateServiceSchema } from "@workspace/db/schema";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { category, search, page = "1", limit = "12" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions: Parameters<typeof and>[0][] = [eq(servicesTable.available, true)];
    if (category && typeof category === "string") {
      conditions.push(eq(servicesTable.category, category));
    }
    if (search && typeof search === "string") {
      conditions.push(ilike(servicesTable.name, `%${search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [services, totalResult] = await Promise.all([
      db.select().from(servicesTable).where(where).limit(limitNum).offset(offset).orderBy(servicesTable.createdAt),
      db.select({ count: count() }).from(servicesTable).where(where),
    ]);

    const total = totalResult[0]?.count ?? 0;
    res.json({
      services,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list services");
    res.status(500).json({ error: "internal_error", message: "Failed to list services" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const rows = await db
      .selectDistinct({ category: servicesTable.category })
      .from(servicesTable)
      .where(eq(servicesTable.available, true));
    res.json({ categories: rows.map((r) => r.category) });
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "internal_error", message: "Failed to list categories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return void res.status(400).json({ error: "bad_request", message: "Invalid service ID" });

    const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, id));
    if (!service) return void res.status(404).json({ error: "not_found", message: "Service not found" });

    res.json(service);
  } catch (err) {
    req.log.error({ err }, "Failed to get service");
    res.status(500).json({ error: "internal_error", message: "Failed to get service" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = insertServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: parsed.error.message });
    }

    const [service] = await db.insert(servicesTable).values(parsed.data).returning();
    res.status(201).json(service);
  } catch (err) {
    req.log.error({ err }, "Failed to create service");
    res.status(500).json({ error: "internal_error", message: "Failed to create service" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return void res.status(400).json({ error: "bad_request", message: "Invalid service ID" });

    const parsed = updateServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: parsed.error.message });
    }

    const [service] = await db
      .update(servicesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(servicesTable.id, id))
      .returning();

    if (!service) return void res.status(404).json({ error: "not_found", message: "Service not found" });
    res.json(service);
  } catch (err) {
    req.log.error({ err }, "Failed to update service");
    res.status(500).json({ error: "internal_error", message: "Failed to update service" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return void res.status(400).json({ error: "bad_request", message: "Invalid service ID" });

    const [deleted] = await db.delete(servicesTable).where(eq(servicesTable.id, id)).returning();
    if (!deleted) return void res.status(404).json({ error: "not_found", message: "Service not found" });

    res.json({ success: true, message: "Service deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete service");
    res.status(500).json({ error: "internal_error", message: "Failed to delete service" });
  }
});

export default router;
