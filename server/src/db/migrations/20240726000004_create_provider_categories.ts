import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('provider_categories', (table) => {
    table.increments('id').primary();
    table.integer('provider_id').unsigned().notNullable();
    table.integer('category_id').unsigned().notNullable();
    table.json('qualified_tiers').nullable(); // Array of tier names: ['basic', 'expert', 'premium']
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('verified_at').nullable();
    table.integer('verified_by').unsigned().nullable();
    table.timestamps(true, true);
    
    table.foreign('provider_id').references('users.id').onDelete('CASCADE');
    table.foreign('category_id').references('service_categories.id').onDelete('CASCADE');
    table.foreign('verified_by').references('users.id');
    table.unique(['provider_id', 'category_id']); // One entry per provider per category
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('provider_categories');
}


