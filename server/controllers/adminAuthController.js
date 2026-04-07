import { ROLE_ADMIN, authGuard, hashPassword, signAccessToken, verifyPassword } from "../services/authService.js";
import { sendPasswordCodeEmail } from "../services/mailService.js";
import { consumePasswordCode, issuePasswordCode } from "../services/twoFactorService.js";
import { findUserByEmail } from "../services/userService.js";
import { findAdminById, updateUserPasswordHash, getAdminProfileById } from "../services/adminAuthService.js";

export function createAdminAuthController(db) {
  async function login(req, res) {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await findUserByEmail(db, email);
    if (!user || Number(user.role) !== ROLE_ADMIN) return res.status(401).json({ error: "invalid credentials" });
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = signAccessToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  }

  async function forgotPassword(req, res) {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    if (!email) return res.status(400).json({ error: "email is required" });

    const user = await findUserByEmail(db, email);
    if (!user || Number(user.role) !== ROLE_ADMIN) {
      return res.json({ ok: true, message: "If account exists, a verification code was sent." });
    }

    const code = await issuePasswordCode(db, user.id);
    await sendPasswordCodeEmail({ to: user.email, code });
    return res.json({ ok: true, message: "Verification code sent." });
  }

  async function resetPassword(req, res) {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "email, code and newPassword are required" });
    }
    if (newPassword.length < 8) return res.status(400).json({ error: "newPassword must be at least 8 characters" });

    const user = await findUserByEmail(db, email);
    if (!user || Number(user.role) !== ROLE_ADMIN) return res.status(400).json({ error: "invalid reset request" });

    const validCode = await consumePasswordCode(db, user.id, code);
    if (!validCode) return res.status(400).json({ error: "invalid or expired code" });

    await updateUserPasswordHash(db, user.id, await hashPassword(newPassword));

    return res.json({ ok: true });
  }

  async function requestChangePasswordCode(req, res) {
    const userId = Number(req.auth.sub);
    const user = await findAdminById(db, userId);
    if (!user || Number(user.role) !== ROLE_ADMIN) return res.status(403).json({ error: "admin only" });

    const code = await issuePasswordCode(db, user.id);
    await sendPasswordCodeEmail({ to: user.email, code });
    return res.json({ ok: true, message: "Verification code sent." });
  }

  async function changePassword(req, res) {
    const userId = Number(req.auth.sub);
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");
    const code = String(req.body?.code || "");

    if (!currentPassword || !newPassword || !code) {
      return res.status(400).json({ error: "currentPassword, newPassword and code are required" });
    }
    if (newPassword.length < 8) return res.status(400).json({ error: "newPassword must be at least 8 characters" });

    const user = await findAdminById(db, userId);
    if (!user || Number(user.role) !== ROLE_ADMIN) return res.status(403).json({ error: "admin only" });

    const ok = await verifyPassword(currentPassword, user.password_hash);
    if (!ok) return res.status(400).json({ error: "current password is invalid" });

    const validCode = await consumePasswordCode(db, user.id, code);
    if (!validCode) return res.status(400).json({ error: "invalid or expired code" });

    await updateUserPasswordHash(db, user.id, await hashPassword(newPassword));

    return res.json({ ok: true });
  }

  return {
    login,
    forgotPassword,
    resetPassword,
    requestChangePasswordCode,
    changePassword,
    me: async (req, res) => {
      const user = await getAdminProfileById(db, Number(req.auth.sub));
      return res.json({ user: user || null });
    },
    adminGuard: authGuard(ROLE_ADMIN),
  };
}
