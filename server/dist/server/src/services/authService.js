"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.registerUser = registerUser;
exports.authenticateUser = authenticateUser;
exports.generateJwtForUser = generateJwtForUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
function getUser(email) {
    return __awaiter(this, void 0, void 0, function* () {
        return User_1.default.query().findOne({ email });
    });
}
function registerUser(email, password, firstName, lastName) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = yield bcrypt_1.default.hash(password, 10);
        return User_1.default.query().insertAndFetch({
            email,
            password: hash,
            first_name: firstName,
            last_name: lastName,
            is_service_provider: false,
            is_admin: false,
            total_jobs_completed: 0,
            total_jobs_declined: 0,
            is_available: true
        });
    });
}
function authenticateUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield getUser(email);
        if (user && user.password && (yield bcrypt_1.default.compare(password, user.password))) {
            return user;
        }
    });
}
function generateJwtForUser(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
}
