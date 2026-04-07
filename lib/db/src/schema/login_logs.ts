import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const loginLogsTable = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  identifier: text("identifier").notNull(),
  ipAddress: text("ip_address"),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type LoginLog = typeof loginLogsTable.$inferSelect;
