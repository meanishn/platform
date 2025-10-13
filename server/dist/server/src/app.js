"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const objection_1 = require("objection");
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("./db/knexfile"));
const routes_1 = __importDefault(require("./routes"));
require("./config/passport"); // Ensure this is imported to initialize passport strategies
dotenv_1.default.config();
const env = process.env.NODE_ENV || 'development';
// Initialize knex and bind to objection
const db = (0, knex_1.default)(knexfile_1.default[env]);
objection_1.Model.knex(db); // <-- IMPORTANT: Bind Objection.js to Knex
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', routes_1.default);
exports.default = app;
