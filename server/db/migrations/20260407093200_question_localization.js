/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("question_localizations", (table) => {
        table.increments("id").primary();
        table.string("question_key", 128).notNullable();
        table
          .integer("locale_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("locales")
          .onDelete("CASCADE");
        table.text("question_text").notNullable();
        table.text("answer_text").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.unique(["question_key", "locale_id"], "uniq_question_localizations_key_locale");
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("question_localizations");
}