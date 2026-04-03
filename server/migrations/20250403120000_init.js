/**
 * @param { import('knex').Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("questions", (table) => {
    table.increments("id").primary();
    table.text("text").notNullable();
    table.string("option_a", 512).notNullable();
    table.string("option_b", 512).notNullable();
    table.string("option_c", 512).notNullable();
    table.string("option_d", 512).notNullable();
    table.tinyint("correct_index").unsigned().notNullable();
    table.string("difficulty", 32).defaultTo("normal");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("matches", (table) => {
    table.increments("id").primary();
    table.string("status", 16).notNullable().defaultTo("pending");
    table.string("context_id", 255).nullable();
    table.string("mode", 16).notNullable();
    table.tinyint("current_turn_seat").unsigned().nullable();
    table.integer("round_number").unsigned().notNullable().defaultTo(0);
    table.integer("current_question_id").unsigned().nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.foreign("current_question_id").references("questions.id").onDelete("SET NULL");
  });

  await knex.schema.createTable("match_players", (table) => {
    table.increments("id").primary();
    table.integer("match_id").unsigned().notNullable();
    table.string("fb_player_id", 64).notNullable();
    table.tinyint("seat").unsigned().notNullable();
    table.integer("score").unsigned().notNullable().defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.unique(["match_id", "seat"]);
    table.unique(["match_id", "fb_player_id"]);
    table.foreign("match_id").references("matches.id").onDelete("CASCADE");
  });

  await knex.schema.createTable("turns", (table) => {
    table.increments("id").primary();
    table.integer("match_id").unsigned().notNullable();
    table.integer("question_id").unsigned().notNullable();
    table.string("fb_player_id", 64).notNullable();
    table.tinyint("answer_index").unsigned().nullable();
    table.boolean("is_correct").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.foreign("match_id").references("matches.id").onDelete("CASCADE");
    table.foreign("question_id").references("questions.id").onDelete("CASCADE");
  });
}

/**
 * @param { import('knex').Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("turns");
  await knex.schema.dropTableIfExists("match_players");
  await knex.schema.dropTableIfExists("matches");
  await knex.schema.dropTableIfExists("questions");
}
