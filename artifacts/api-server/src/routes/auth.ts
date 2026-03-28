import { Router, type IRouter } from "express";
import { db, usersTable, loginLogsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const router: IRouter = Router();

const activeUserTokens = new Map<string, number>();

export function generateUserToken(userId: number): string {
  const token = crypto
    .createHmac("sha256", process.env.SESSION_SECRET ?? "vanted-secret-key-change-in-production")
    .update(`user:${userId}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`)
    .digest("hex");
  activeUserTokens.set(token, userId);
  return token;
}

export function validateUserToken(token: string): number | null {
  return activeUserTokens.get(token) ?? null;
}

export function revokeUserToken(token: string): void {
  activeUserTokens.delete(token);
}

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

async function recordLoginLog(type: "admin" | "user", identifier: string, ipAddress: string | null, success: boolean) {
  await db.insert(loginLogsTable).values({ type, identifier, ipAddress, success });
}

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

router.post("/signup", async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: parsed.error.errors[0]?.message ?? "Invalid input" });
    }

    const { email, username, password } = parsed.data;

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(or(eq(usersTable.email, email.toLowerCase()), eq(usersTable.username, username.toLowerCase())))
      .limit(1);

    if (existing.length > 0) {
      return void res.status(409).json({ error: "conflict", message: "Email or username already in use" });
    }

    const passwordHash = hashPassword(password);

    const [user] = await db
      .insert(usersTable)
      .values({ email: email.toLowerCase(), username: username.toLowerCase(), passwordHash })
      .returning();

    await recordLoginLog("user", email.toLowerCase(), getClientIp(req), true);

    const token = generateUserToken(user.id);

    res.status(201).json({ token, userId: user.id, email: user.email, username: user.username });
  } catch (err) {
    req.log.error({ err }, "User signup failed");
    res.status(500).json({ error: "internal_error", message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "validation_error", message: "Identifier and password required" });
    }

    const { identifier, password } = parsed.data;
    const ip = getClientIp(req);
    const normalizedIdentifier = identifier.toLowerCase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, normalizedIdentifier), eq(usersTable.username, normalizedIdentifier)))
      .limit(1);

    if (!user || user.passwordHash !== hashPassword(password)) {
      await new Promise((r) => setTimeout(r, 500));
      await recordLoginLog("user", normalizedIdentifier, ip, false);
      return void res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    }

    await recordLoginLog("user", user.email, ip, true);

    const token = generateUserToken(user.id);

    res.json({ token, userId: user.id, email: user.email, username: user.username });
  } catch (err) {
    req.log.error({ err }, "User login failed");
    res.status(500).json({ error: "internal_error", message: "Login failed" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.headers["x-user-token"] as string | undefined;
  if (token) {
    revokeUserToken(token);
  }
  res.json({ success: true, message: "Logged out" });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers["x-user-token"] as string | undefined;
    if (!token) {
      return void res.status(401).json({ error: "unauthorized", message: "User token required" });
    }

    const userId = validateUserToken(token);
    if (!userId) {
      return void res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
    }

    const [user] = await db
      .select({ id: usersTable.id, email: usersTable.email, username: usersTable.username, createdAt: usersTable.createdAt })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return void res.status(401).json({ error: "unauthorized", message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Get me failed");
    res.status(500).json({ error: "internal_error", message: "Failed to get user" });
  }
});

export default router;
