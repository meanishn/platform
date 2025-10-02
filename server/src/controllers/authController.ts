import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { registerUser, authenticateUser, generateJwtForUser, getUser } from '../services/authService';
import { ResponseHelper } from '../utils/responseHelper';
import { toAuthUserDto } from '../sanitizers';
import { AuthResponseDto } from '../shared/dtos';

export const register = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return ResponseHelper.validationError(
      res,
      ResponseHelper.formatValidationErrors(result.array())
    );
  }
  
  const { email, password, firstName, lastName } = req.body;

  const existingUser = await getUser(email);

  if (existingUser) {
    return ResponseHelper.conflict(res, 'User already exists');
  }

  const user = await registerUser(email, password, firstName, lastName);
  const token = generateJwtForUser(user);
  
  const authResponse: AuthResponseDto = {
    user: toAuthUserDto(user),
    token
  };
  
  return ResponseHelper.created(res, authResponse, 'Registration successful');
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);
  if (!user) {
    return ResponseHelper.unauthorized(res, 'Invalid credentials');
  }
  
  const token = generateJwtForUser(user);
  
  const authResponse: AuthResponseDto = {
    user: toAuthUserDto(user),
    token
  };
  
  return ResponseHelper.success(res, authResponse, 'Login successful');
};

export const verify = async (req: Request, res: Response) => {
  if (!req.user) {
    return ResponseHelper.unauthorized(res, 'Not authenticated');
  }

  // Convert Express.User to User model for sanitization
  const userDto = toAuthUserDto(req.user);
  
  return ResponseHelper.success(res, { user: userDto });
};

export const googleCallback = async (req: Request, res: Response) => {
  if (!req.user) {
    return ResponseHelper.unauthorized(res, 'Authentication failed');
  }

  const token = generateJwtForUser(req.user as any);
  
  const authResponse: AuthResponseDto = {
    user: toAuthUserDto(req.user as any),
    token
  };
  
  return ResponseHelper.success(res, authResponse, 'Google authentication successful');
};