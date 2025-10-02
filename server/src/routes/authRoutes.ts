import { Router } from 'express';
import { checkSchema } from 'express-validator';
import passport from 'passport';
import { register, login, verify, googleCallback } from '../controllers/authController';
import {validateCreateUser} from '../validators/user.validation';
import { withValidation } from '../middleware/requestValidation';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', withValidation(validateCreateUser), register);
router.post('/login', login);
router.get('/verify', requireAuth, verify);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
  session: false,
}), googleCallback);

export default router;