/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable("players", (table) => {
        table.increments("id").primary();
        table
          .integer("user_id")
          .unsigned()
          .notNullable()
          .unique()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
        table.string("fb_player_id", 255).nullable().unique();
        table.string("fb_user_id", 255).nullable().unique();
        table.string("display_name", 255).nullable();
        table.string("avatar_url", 512).nullable();
        table.string("locale", 32).nullable();
        table.integer("coin_balance").notNullable().defaultTo(0);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTable("players");
}
