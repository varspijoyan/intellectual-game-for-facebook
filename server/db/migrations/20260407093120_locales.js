/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("locales", (table) => {
        table.increments("id").primary();
        table.string("code", 16).notNullable().unique();
        table.string("name", 64).notNullable();
        table.boolean("is_enabled").notNullable().defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("locales");
}