import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('users').del();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  await knex('users').insert([
    {
      email: 'admin@platform.com',
      password: adminPassword,
      first_name: 'Platform',
      last_name: 'Admin',
      is_admin: true,
      is_service_provider: false,
      provider_status: null,
      total_jobs_completed: 0,
      total_jobs_declined: 0,
      is_available: false
    },
    {
      email: 'john.smith@email.com',
      password: await bcrypt.hash('password123', 10),
      first_name: 'John',
      last_name: 'Smith',
      phone: '+1234567890',
      address: '123 Main St, Anytown, ST 12345',
      latitude: 40.7128,
      longitude: -74.0060,
      is_service_provider: true,
      provider_status: 'approved',
      provider_bio: 'Experienced electrician with over 10 years in residential and commercial electrical work. Licensed and insured.',
      provider_skills: JSON.stringify(['Electrical wiring', 'Panel installations', 'Troubleshooting', 'LED lighting']),
      provider_certifications: JSON.stringify([
        { name: 'Licensed Electrician', issuer: 'State Board', year: 2015 },
        { name: 'OSHA Safety Certified', issuer: 'OSHA', year: 2023 }
      ]),
      average_rating: 4.8,
      total_jobs_completed: 147,
      total_jobs_declined: 8,
      response_time_average: 12,
      is_available: true,
      provider_approved_at: new Date().toISOString(),
      is_admin: false
    },
    {
      email: 'maria.garcia@email.com',
      password: await bcrypt.hash('password123', 10),
      first_name: 'Maria',
      last_name: 'Garcia',
      phone: '+1234567891',
      address: '456 Oak Ave, Somewhere, ST 12346',
      latitude: 40.7589,
      longitude: -73.9851,
      is_service_provider: true,
      provider_status: 'approved',
      provider_bio: 'Professional plumber specializing in residential repairs and installations. Available for emergency calls.',
      provider_skills: JSON.stringify(['Pipe repair', 'Drain cleaning', 'Fixture installation', 'Water heater repair']),
      provider_certifications: JSON.stringify([
        { name: 'Licensed Electrician', issuer: 'State Board', year: 2014 },
        { name: 'Master Plumber License', issuer: 'State Board', year: 2018 },
        { name: 'Backflow Prevention Certified', issuer: 'Water Authority', year: 2022 }
      ]),
      average_rating: 4.9,
      total_jobs_completed: 203,
      total_jobs_declined: 5,
      response_time_average: 8,
      is_available: true,
      provider_approved_at: new Date().toISOString(),
      is_admin: false
    },
    {
      email: 'customer@email.com',
      password: await bcrypt.hash('password123', 10),
      first_name: 'Jane',
      last_name: 'Customer',
      phone: '+1234567892',
      address: '789 Pine St, Nowhere, ST 12347',
      latitude: 40.7505,
      longitude: -73.9934,
      is_service_provider: false,
      provider_status: null,
      total_jobs_completed: 0,
      total_jobs_declined: 0,
      is_available: false,
      is_admin: false
    }
  ]);
}
