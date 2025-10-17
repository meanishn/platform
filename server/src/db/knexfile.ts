import path from 'path';
import { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database URL configured:', !!process.env.DATABASE_URL);

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      extension: 'ts',
      directory: path.join(__dirname, 'migrations'),
      tableName: 'migrations_history',
    },
    seeds: {
      extension: 'ts',
      directory: path.join(__dirname, 'seeds'),
    },
  },
  
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for managed PostgreSQL (Render, Heroku, etc.)
    },
    migrations: {
      extension: 'js', // Built files are .js in production
      directory: path.join(__dirname, 'migrations'),
      tableName: 'migrations_history',
    },
    seeds: {
      extension: 'js', // Built files are .js in production
      directory: path.join(__dirname, 'seeds'),
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;