import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Model } from 'objection';
import knex from 'knex';
import knexConfig from './db/knexfile';
import routes from './routes';
import './config/passport'; // Ensure this is imported to initialize passport strategies

dotenv.config();

const env = process.env.NODE_ENV || 'development'

// Initialize knex and bind to objection
const db = knex(knexConfig[env]);
Model.knex(db); // <-- IMPORTANT: Bind Objection.js to Knex

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', routes);

export default app;