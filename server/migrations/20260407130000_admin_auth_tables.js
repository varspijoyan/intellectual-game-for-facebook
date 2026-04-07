/**
 * @param { import('knex').Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("admin_users", (table) => {
    table.increments("id").primary();
    table.string("username", 128).notNullable().unique();
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("admin_password_resets", (table) => {
    table.increments("id").primary();
    table.integer("admin_user_id").unsigned().notNullable();
    table.string("email", 255).notNullable();
    table.string("reset_code", 64).notNullable();
    table.timestamp("expires_at").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table
      .foreign("admin_user_id")
      .references("admin_users.id")
      .onDelete("CASCADE");
  });
}

/**
 * @param { import('knex').Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("admin_password_resets");
  await knex.schema.dropTableIfExists("admin_users");
}
