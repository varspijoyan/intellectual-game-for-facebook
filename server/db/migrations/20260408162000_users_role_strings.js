/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.string("role", 16).notNullable().alter();
  });

  await knex("users")
    .whereIn("role", [1, "1", "admin"])
    .update({ role: "admin" });

  await knex("users")
    .whereIn("role", [2, "2", "player"])
    .update({ role: "player" });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex("users")
    .where({ role: "admin" })
    .update({ role: 1 });

  await knex("users")
    .where({ role: "player" })
    .update({ role: 2 });

  await knex.schema.alterTable("users", (table) => {
    table.tinyint("role").notNullable().comment("1=admin, 2=player").alter();
  });
}
