import { ROLE_ADMIN, ROLE_PLAYER, normalizeRole } from "./authService.js";

let cachedRoleColumnType = null;

async function getRoleColumnType(db) {
  if (cachedRoleColumnType) return cachedRoleColumnType;

  const databaseName = process.env.MYSQL_DATABASE || "fb_soccer_quiz_game";
  const [rows] = await db.raw(
    `
      SELECT DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
      LIMIT 1
    `,
    [databaseName]
  );

  const row = Array.isArray(rows) ? rows[0] : null;
  cachedRoleColumnType = String(row?.DATA_TYPE || "").toLowerCase();
  return cachedRoleColumnType;
}

export async function mapRoleForStorage(db, role) {
  const normalized = normalizeRole(role);
  const dataType = await getRoleColumnType(db);
  if (dataType === "tinyint" || dataType === "int" || dataType === "smallint") {
    if (normalized === ROLE_ADMIN) return 1;
    if (normalized === ROLE_PLAYER) return 2;
  }
  return normalized;
}
