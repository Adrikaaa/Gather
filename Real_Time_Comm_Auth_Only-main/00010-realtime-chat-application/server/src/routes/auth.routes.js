import { Router } from 'express';
import { register, login, refresh, logout, me, googleCallback } from '../controller/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { passport } from '../config/passport.js';

/** Authentication endpoints mounted beneath /api/v1/auth. */
export const authRouter = Router();
authRouter.post('/register', registerValidator, validate, register);
authRouter.post('/login', loginValidator, validate, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, me);

// Google OAuth: no ?code yet, so Passport redirects the browser to Google's account picker.
authRouter.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
  session: false,
}));

// Google OAuth: Google sends the browser back here with ?code=.
authRouter.get('/google/callback', googleCallback);
