/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("athletes", (table) => {
        table.increments("id").primary();
        table
          .integer("team_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("teams")
          .onDelete("CASCADE");
        table.string("first_name", 128).notNullable();
        table.string("last_name", 128).notNullable();
        table.string("position_code", 32).notNullable();
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
    await knex.schema.dropTable("athletes");
}