import path from 'path';
import { Knex } from 'knex';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });
console.log('Database URL:', process.env.DATABASE_URL);
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
};

export default config;