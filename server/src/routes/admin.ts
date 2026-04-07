import { createHash, randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import type { Db } from "../db.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(1).optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const changePasswordSchema = z.object({
  email: z.string().email().optional(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

function hashPassword(rawPassword: string) {
  return createHash("sha256").update(rawPassword).digest("hex");
}

function generateUsernameFromEmail(email: string) {
  const base = email.split("@")[0]?.trim() ?? "";
  const normalized = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized || `user_${randomUUID().slice(0, 8)}`;
}

async function resolveUniqueUsername(db: Db, preferred: string, excludeId?: number) {
  const base = preferred.trim() || `user_${randomUUID().slice(0, 8)}`;
  let candidate = base;
  let attempt = 0;

  while (attempt < 20) {
    let query = db("admin_users").where({ username: candidate });
    if (excludeId) {
      query = query.andWhereNot({ id: excludeId });
    }
    const existing = await query.first();
    if (!existing) return candidate;
    attempt += 1;
    candidate = `${base}_${attempt}`;
  }

  return `${base}_${randomUUID().slice(0, 6)}`;
}

export function createAdminRouter(db: Db) {
  const r = Router();

  r.post("/auth/register", async (req: any, res: any, next: any) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid register payload" });
        return;
      }

      const { email, password, username } = parsed.data;
      const generatedUsername = username?.trim() || generateUsernameFromEmail(email);

      const existing = await db("admin_users")
        .where({ email })
        .orWhere({ username: generatedUsername })
        .first();
      if (existing) {
        res.status(409).json({ error: "Admin user already exists" });
        return;
      }

      const [id] = await db("admin_users").insert({
        username: generatedUsername,
        email,
        password_hash: hashPassword(password),
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      res.status(201).json({
        id,
        email,
        username: generatedUsername,
      });
    } catch (error) {
      next(error);
    }
  });

  r.post("/auth/login", async (req: any, res: any, next: any) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid login payload" });
        return;
      }

      const { email, password } = parsed.data;
      const identifier = email.trim();
      let adminUser = await db("admin_users")
        .where({ email: identifier })
        .first();

      if (!adminUser) {
        const generatedUsername = await resolveUniqueUsername(
          db,
          generateUsernameFromEmail(identifier)
        );
        const [createdId] = await db("admin_users").insert({
          username: generatedUsername,
          email: identifier,
          password_hash: hashPassword(password),
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        });
        adminUser = await db("admin_users")
          .where({ id: createdId })
          .first();
        if (!adminUser) {
          res.status(500).json({ error: "Failed to create admin user" });
          return;
        }
      }

      const passwordMatch = hashPassword(password) === adminUser.password_hash;

      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const generatedUsername = await resolveUniqueUsername(
        db,
        generateUsernameFromEmail(adminUser.email),
        adminUser.id
      );
      if (adminUser.username !== generatedUsername) {
        await db("admin_users")
          .where({ id: adminUser.id })
          .update({ username: generatedUsername, updated_at: db.fn.now() });
        adminUser.username = generatedUsername;
      }

      // Token is intentionally simple for now until full admin auth is introduced.
      res.json({
        token: `admin_${randomUUID()}`,
        username: adminUser.username,
      });
    } catch (error) {
      next(error);
    }
  });

  r.post("/auth/forgot-password", async (req: any, res: any, next: any) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid forgot-password payload" });
        return;
      }

      const adminUser = await db("admin_users")
        .where({ email: parsed.data.email })
        .first();

      if (adminUser) {
        const code = randomUUID().replaceAll("-", "").slice(0, 12);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await db("admin_password_resets").insert({
          admin_user_id: adminUser.id,
          email: adminUser.email,
          reset_code: code,
          expires_at: expiresAt,
          created_at: db.fn.now(),
        });
      }

      res.json({
        message: "If an account exists for this email, reset instructions were sent.",
      });
    } catch (error) {
      next(error);
    }
  });

  r.post("/auth/change-password", async (req: any, res: any, next: any) => {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid change-password payload" });
        return;
      }

      const { email, currentPassword, newPassword, confirmPassword } = parsed.data;
      let adminUser;
      if (email) {
        adminUser = await db("admin_users")
          .where({ email })
          .first();
      } else {
        adminUser = await db("admin_users")
          .orderBy("id", "asc")
          .first();
      }
      if (!adminUser) {
        res.status(404).json({ error: "Admin account not found. Create admin_users row first." });
        return;
      }

      const currentPasswordMatch =
        hashPassword(currentPassword) === adminUser.password_hash;
      if (!currentPasswordMatch) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
      }
      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: "Passwords do not match" });
        return;
      }

      await db("admin_users")
        .where({ id: adminUser.id })
        .update({
          password_hash: hashPassword(newPassword),
          updated_at: db.fn.now(),
        });

      res.json({ message: "Password changed successfully." });
    } catch (error) {
      next(error);
    }
  });

  return r;
}
