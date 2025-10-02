import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing provider categories
  await knex('provider_categories').del();

  // Get user IDs
  const johnSmith = await knex('users').where('email', 'john.smith@email.com').first();
  const mariaGarcia = await knex('users').where('email', 'maria.garcia@email.com').first();
  const admin = await knex('users').where('email', 'admin@platform.com').first();

  if (!johnSmith || !mariaGarcia || !admin) {
    console.warn('Users not found, skipping provider qualifications seed');
    return;
  }

  // Get category IDs
  const electricalCategory = await knex('service_categories').where('name', 'Electrical').first();
  const plumbingCategory = await knex('service_categories').where('name', 'Plumbing').first();

  if (!electricalCategory || !plumbingCategory) {
    console.warn('Service categories not found, skipping provider qualifications seed');
    return;
  }

  // John Smith (Electrician) - Qualified for Electrical services (Basic, Expert, Premium)
  await knex('provider_categories').insert([
    {
      provider_id: johnSmith.id,
      category_id: electricalCategory.id,
      qualified_tiers: JSON.stringify(['basic', 'expert', 'premium']),
      is_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: admin.id
    }
  ]);

  // Maria Garcia (Plumber) - Qualified for Plumbing services (Basic, Expert, Premium)
  await knex('provider_categories').insert([
    {
      provider_id: mariaGarcia.id,
      category_id: plumbingCategory.id,
      qualified_tiers: JSON.stringify(['basic', 'expert', 'premium']),
      is_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: admin.id
    }
  ]);

  console.log('✅ Provider qualifications seeded successfully');
}

