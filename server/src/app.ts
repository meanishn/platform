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

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Health check endpoint (for monitoring and keeping server alive)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api', routes);

export default app;