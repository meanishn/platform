import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('service_categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('description').nullable();
    table.string('icon').nullable(); // Icon name or URL
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('service_categories');
}


