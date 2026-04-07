import crypto from "node:crypto";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issuePasswordCode(db, userId) {
  const code = generateCode();
  const ttlMinutes = Number(process.env.RESET_CODE_TTL_MINUTES || 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await db("password_reset_codes")
    .where({ user_id: userId })
    .whereNull("used_at")
    .update({ used_at: db.fn.now() });

  await db("password_reset_codes").insert({
    user_id: userId,
    code_hash: sha256(code),
    expires_at: expiresAt,
    created_at: db.fn.now(),
  });

  return code;
}

export async function consumePasswordCode(db, userId, code) {
  const row = await db("password_reset_codes")
    .where({ user_id: userId })
    .whereNull("used_at")
    .andWhere("expires_at", ">", db.fn.now())
    .orderBy("id", "desc")
    .first();

  if (!row) return false;

  if (row.code_hash !== sha256(String(code || ""))) return false;

  await db("password_reset_codes")
    .where({ id: row.id })
    .update({ used_at: db.fn.now() });

  return true;
}
