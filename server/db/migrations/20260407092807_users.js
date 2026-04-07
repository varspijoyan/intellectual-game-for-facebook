/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email", 255).notNullable().unique();
      table.string("password_hash", 255).notNullable();
      table
        .tinyint("role")
        .notNullable()
        .comment("1=admin, 2=player");
      table.boolean("is_active").notNullable().defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("users");
}
