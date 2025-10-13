import { Knex } from 'knex';

/**
 * Migration: Create request_eligible_providers table
 * 
 * Purpose: Store eligible provider relationships with hybrid state management
 * - Replaces notification-based eligibility tracking
 * - Stores matching metadata (scores, distances, rankings)
 * - Hybrid approach: status enum + timestamps
 * - Supports cancellation tracking
 * 
 * Date: October 11, 2025
 */

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('request_eligible_providers', (table) => {
    table.increments('id').primary();
    table.integer('request_id').unsigned().notNullable();
    table.integer('provider_id').unsigned().notNullable();
    
    // Matching metadata from algorithm
    table.decimal('match_score', 5, 2).notNullable().comment('Provider match score (0-100)');
    table.decimal('distance_miles', 8, 2).nullable().comment('Distance from provider to job location');
    table.integer('rank').notNullable().comment('Rank among all eligible providers (1=best)');
    
    // STATE MANAGEMENT: HYBRID APPROACH
    // Status enum provides fast filtering, timestamps provide source of truth
    table.enum('status', [
      // Normal flow states
      'eligible',                  // Matched by algorithm, can be notified
      'notified',                  // Notification sent to provider
      'accepted',                  // Provider accepted, waiting for customer selection
      'selected',                  // Customer chose this provider (winner)
      'rejected',                  // Another provider was selected
      
      // Cancellation states
      'cancelled_unassigned',      // Job cancelled before provider selection
      'cancelled_assigned',        // Job cancelled after assignment (by customer)
      'cancelled_by_provider',     // Provider cancelled after selection
      'cancelled_in_progress'      // Provider cancelled during work
    ]).notNullable().defaultTo('eligible').comment('Current provider status');
    
    // TIMESTAMPS: Source of truth for state transitions
    table.timestamp('notified_at').nullable().comment('When provider was notified');
    table.timestamp('accepted_at').nullable().comment('When provider accepted the job');
    table.timestamp('selected_at').nullable().comment('When customer selected this provider');
    table.timestamp('cancelled_at').nullable().comment('When cancellation occurred');
    
    // Audit timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    
    // Constraints
    table.unique(['request_id', 'provider_id'], {
      indexName: 'request_eligible_providers_unique'
    });
    
    table
      .foreign('request_id')
      .references('service_requests.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    table
      .foreign('provider_id')
      .references('users.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Indexes for performance
    table.index('request_id', 'idx_rep_request_id');
    table.index('provider_id', 'idx_rep_provider_id');
    table.index(['request_id', 'rank'], 'idx_rep_request_rank');
    table.index(['provider_id', 'status'], 'idx_rep_provider_status');
    table.index(['request_id', 'status'], 'idx_rep_request_status');
    table.index('status', 'idx_rep_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('request_eligible_providers');
}
