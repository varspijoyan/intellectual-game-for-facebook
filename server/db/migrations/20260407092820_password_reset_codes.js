/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("password_reset_codes", (table) => {
        table.increments("id").primary();
        table
          .integer("user_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
        table.string("code_hash", 255).notNullable();
        table.timestamp("expires_at").notNullable();
        table.timestamp("used_at").nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index(["user_id", "expires_at"], "idx_password_reset_codes_user_expires");
      });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("password_reset_codes");
}
