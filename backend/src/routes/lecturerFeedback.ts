import { Router } from 'express';
import { LecturerFeedbackController } from '@/controllers/lecturerFeedbackController';
import { authenticateToken, requireVerified } from '@/middleware/auth';
import { validate, createLecturerFeedbackSchema } from '@/middleware/validation';

const router = Router();

// Public routes
router.get('/', LecturerFeedbackController.getLecturerFeedback);

// Protected routes
router.post(
  '/',
  authenticateToken,
  requireVerified,
  validate(createLecturerFeedbackSchema),
  LecturerFeedbackController.createLecturerFeedback
);
router.get('/my-feedback', authenticateToken, LecturerFeedbackController.getUserLecturerFeedback);

export default router;
