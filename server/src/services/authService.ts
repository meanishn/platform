import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export async function getUser(email: string): Promise<User | undefined> {
  return User.query().findOne({ email });
}

export async function registerUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  const hash = await bcrypt.hash(password, 10);
  return User.query().insertAndFetch({
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
}

export async function authenticateUser(email: string, password: string): Promise<User | undefined> {
  const user = await getUser(email);
  if (user && user.password && await bcrypt.compare(password, user.password)) {
    return user;
  }
}

export function generateJwtForUser(user: User) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
}

