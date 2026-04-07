/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("position_labels", (table) => {
        table.increments("id").primary();
        table.string("position_code", 32).notNullable();
        table
          .integer("locale_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("locales")
          .onDelete("CASCADE");
        table.string("label", 128).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.unique(["position_code", "locale_id"], "uniq_position_labels_position_locale");
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("position_labels");
}
