export function findAdminByEmail(db, email) {
  return db("users").where({ email }).andWhere({ role: 1 }).first();
}

export function findAdminById(db, id) {
  return db("users").where({ id }).andWhere({ role: 1 }).first();
}

export async function updateUserPasswordHash(db, userId, passwordHash) {
  await db("users")
    .where({ id: userId })
    .update({
      password_hash: passwordHash,
      updated_at: db.fn.now(),
    });
}

export function getAdminProfileById(db, userId) {
  return db("users")
    .select("id", "email", "role", "created_at", "updated_at")
    .where({ id: userId, role: 1 })
    .first();
}
