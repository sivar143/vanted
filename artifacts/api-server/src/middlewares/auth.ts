import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "vanted-admin-2024";
const TOKEN_SECRET = process.env.SESSION_SECRET ?? "vanted-secret-key-change-in-production";

const activeTokens = new Set<string>();

export function generateAdminToken(username: string): string {
  const token = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${username}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`)
    .digest("hex");
  activeTokens.add(token);
  return token;
}

export function validateAdminToken(token: string): boolean {
  return activeTokens.has(token);
}

export function revokeAdminToken(token: string): void {
  activeTokens.delete(token);
}

export function getAdminCredentials() {
  return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers["x-admin-token"] as string | undefined;
  if (!token || !validateAdminToken(token)) {
    res.status(401).json({ error: "unauthorized", message: "Valid admin token required" });
    return;
  }
  next();
}
