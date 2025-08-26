import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { validate, signupSchema, loginSchema, resetPasswordSchema } from '@/middleware/validation';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Public routes
router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/verify', AuthController.verifyEmail);
router.post('/request-reset', AuthController.requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);

export default router;
