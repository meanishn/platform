import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('reviews', (table) => {
    table.increments('id').primary();
    table.integer('request_id').unsigned().notNullable();
    table.integer('reviewer_id').unsigned().notNullable();
    table.integer('reviewee_id').unsigned().notNullable();
    
    table.integer('rating').notNullable(); // 1-5
    table.text('comment').nullable();
    table.json('criteria_ratings').nullable(); // { quality, timeliness, communication, professionalism, value }
    
    table.boolean('is_public').defaultTo(true);
    
    table.timestamps(true, true);
    
    table.foreign('request_id').references('service_requests.id').onDelete('CASCADE');
    table.foreign('reviewer_id').references('users.id').onDelete('CASCADE');
    table.foreign('reviewee_id').references('users.id').onDelete('CASCADE');
    table.unique(['request_id']); // One review per request
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('reviews');
}


