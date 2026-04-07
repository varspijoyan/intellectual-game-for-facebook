import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const ROLE_ADMIN = 1;
export const ROLE_PLAYER = 2;

const TOKEN_TYPE = "Bearer";

export function signAccessToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

export function hashPassword(rawPassword) {
  return bcrypt.hash(rawPassword, 10);
}

export function verifyPassword(rawPassword, passwordHash) {
  return bcrypt.compare(rawPassword, passwordHash);
}

export function extractBearerToken(headerValue) {
  if (!headerValue) return null;
  const [type, token] = String(headerValue).split(" ");
  if (type !== TOKEN_TYPE || !token) return null;
  return token;
}

export function authGuard(requiredRole = null) {
  return (req, res, next) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });

    try {
      const payload = jwt.verify(token, secret);
      req.auth = payload;

      if (requiredRole && Number(payload.role) !== Number(requiredRole)) {
        return res.status(403).json({ error: "Forbidden for this role" });
      }
      return next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
