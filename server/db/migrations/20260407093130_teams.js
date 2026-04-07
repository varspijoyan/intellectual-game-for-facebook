/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("teams", (table) => {
        table.increments("id").primary();
        table
          .integer("country_id")
          .unsigned()
          .nullable()
          .references("id")
          .inTable("countries")
          .onDelete("SET NULL");
        table.string("name", 128).notNullable();
        table.string("short_name", 64).nullable();
        table.string("crest_url", 512).nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
}
    

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("teams");
}