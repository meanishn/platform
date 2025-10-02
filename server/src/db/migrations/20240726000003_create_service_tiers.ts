import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('service_tiers', (table) => {
    table.increments('id').primary();
    table.integer('category_id').unsigned().notNullable();
    table.string('name').notNullable(); // 'Basic', 'Expert', 'Premium'
    table.string('description').nullable();
    table.decimal('base_hourly_rate', 10, 2).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.foreign('category_id').references('service_categories.id').onDelete('CASCADE');
    table.unique(['category_id', 'name']); // One tier name per category
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('service_tiers');
}


