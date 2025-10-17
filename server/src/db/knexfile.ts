import path from 'path';
import { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database URL configured:', !!process.env.DATABASE_URL);

// Base configuration
const baseConfig: Knex.Config = {
  client: 'pg',
  migrations: {
    extension: 'ts',
    directory: path.join(__dirname, 'migrations'),
    tableName: 'migrations_history',
  },
  seeds: {
    extension: 'ts',
    directory: path.join(__dirname, 'seeds'),
  },
};

const config: { [key: string]: Knex.Config } = {
  development: {
    ...baseConfig,
    connection: process.env.DATABASE_URL,
  },
  
  production: {
    ...baseConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for managed PostgreSQL (Render, Heroku, etc.)
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;