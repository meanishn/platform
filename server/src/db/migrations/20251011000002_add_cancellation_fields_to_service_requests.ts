import { Knex } from 'knex';

/**
 * Migration: Add cancellation tracking fields to service_requests
 * 
 * Purpose: Track WHO cancelled, WHEN, WHY, and at what STAGE
 * - Supports cancellation analytics
 * - Enables reopening logic for provider cancellations
 * - Provides audit trail
 * 
 * Date: October 11, 2025
 */

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('service_requests', (table) => {
    table.timestamp('cancelled_at').nullable().comment('When request was cancelled');
    
    table.enum('cancelled_by', ['customer', 'provider', 'admin']).nullable()
      .comment('Who cancelled the request');
    
    table.text('cancellation_reason').nullable()
      .comment('Reason provided for cancellation');
    
    table.enum('cancellation_stage', [
      'pending',      // Before provider selection
      'assigned',     // After selection, before work started
      'in_progress'   // During work
    ]).nullable().comment('Request status when cancelled');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('service_requests', (table) => {
    table.dropColumn('cancelled_at');
    table.dropColumn('cancelled_by');
    table.dropColumn('cancellation_reason');
    table.dropColumn('cancellation_stage');
  });
}
