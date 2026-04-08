import { ROLE_PLAYER } from "./authService.js";
import { mapRoleForStorage } from "./roleStorageService.js";

export function findUserByEmail(db, email) {
  return db("users").where({ email: String(email).toLowerCase() }).first();
}

export function findUserById(db, id) {
  return db("users").where({ id }).first();
}

export function findPlayerByUserId(db, userId) {
  return db("players").where({ user_id: userId }).first();
}

export async function createPlayerUser(db, { email, passwordHash, displayName, locale }) {
  const [userId] = await db("users").insert({
    email: String(email).toLowerCase(),
    password_hash: passwordHash,
    role: await mapRoleForStorage(db, ROLE_PLAYER),
    is_active: true,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  await db("players").insert({
    user_id: userId,
    display_name: displayName || null,
    locale: locale || "en",
    coin_balance: 0,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("users").where({ id: userId }).first();
}
