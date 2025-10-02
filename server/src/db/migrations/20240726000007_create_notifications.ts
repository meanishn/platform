import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    
    table.string('type').notNullable(); // 'new_assignment', 'job_completed', etc.
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.json('data').nullable(); // Additional metadata
    
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();
    table.boolean('is_push_sent').defaultTo(false);
    table.boolean('is_email_sent').defaultTo(false);
    
    table.timestamps(true, true);
    
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.index(['user_id', 'is_read']); // For efficient querying
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notifications');
}


