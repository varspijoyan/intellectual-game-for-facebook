import { ROLE_PLAYER } from "./authService.js";
import { mapRoleForStorage } from "./roleStorageService.js";

export function findPlayerByFacebookPlayerId(db, fbPlayerId) {
  return db("players").where({ fb_player_id: fbPlayerId }).first();
}

export function findUserById(db, userId) {
  return db("users").where({ id: userId }).first();
}

export function findUserByEmail(db, email) {
  return db("users").where({ email }).first();
}

export async function ensureFacebookPlayer(db, fbPlayerId) {
  let player = await findPlayerByFacebookPlayerId(db, fbPlayerId);
  if (player) return player;

  let user = await findUserByEmail(db, `fb_${fbPlayerId}@facebook.local`);
  if (!user) {
    const [newUserId] = await db("users").insert({
      email: `fb_${fbPlayerId}@facebook.local`,
      password_hash: "facebook_oauth_no_password",
      role: await mapRoleForStorage(db, ROLE_PLAYER),
      is_active: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    user = await findUserById(db, newUserId);
  }

  const [playerId] = await db("players").insert({
    user_id: user.id,
    fb_player_id: fbPlayerId,
    display_name: null,
    locale: "en",
    coin_balance: 0,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return db("players").where({ id: playerId }).first();
}
