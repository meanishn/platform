"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
console.log('Database URL:', process.env.DATABASE_URL);
const config = {
    development: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: {
            extension: 'ts',
            directory: path_1.default.join(__dirname, 'migrations'),
            tableName: 'migrations_history',
        },
        seeds: {
            extension: 'ts',
            directory: path_1.default.join(__dirname, 'seeds'),
        },
    },
};
exports.default = config;
