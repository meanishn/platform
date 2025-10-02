import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('request_acceptances', (table) => {
    table.increments('id').primary();
    table.integer('request_id').unsigned().notNullable();
    table.integer('provider_id').unsigned().notNullable();
    table.timestamp('accepted_at').notNullable().defaultTo(knex.fn.now());

    table.unique(['request_id', 'provider_id']);

    table
      .foreign('request_id')
      .references('service_requests.id')
      .onDelete('CASCADE');
    table
      .foreign('provider_id')
      .references('users.id')
      .onDelete('CASCADE');

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('request_acceptances');
}


