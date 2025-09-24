import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken'; // Explicitly import Secret and SignOptions
import pool from '@/config/database';
import { EmailService } from '@/services/emailService';
import { AuthenticatedRequest, ApiResponse, SignupRequest, LoginRequest, ResetPasswordRequest, VerifyEmailRequest, User, UserPayload } from '@/types'; // Import UserPayload

export class AuthController {
  static async signup(req: Request<{}, ApiResponse, SignupRequest>, res: Response<ApiResponse>): Promise<void> {
    try {
      const { name, email, password } = req.body;

      
      // Check if user already exists
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate verification token
      const verificationToken = EmailService.generateToken();

      // Create user
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, verification_token) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, verified, role, created_at`,
        [name, email, passwordHash, verificationToken]
      );

      const user = result.rows[0];

      // Send verification email
      await EmailService.sendVerificationEmail(email, name, verificationToken);

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            role: user.role,
            created_at: user.created_at,
          },
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async login(req: Request<{}, ApiResponse, LoginRequest>, res: Response<ApiResponse>): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await pool.query(
        'SELECT id, name, email, password_hash, verified, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Ensure JWT_SECRET is defined
      const jwtSecretString = process.env.JWT_SECRET;
      if (!jwtSecretString) {
        console.error('JWT_SECRET environment variable is not set.');
        res.status(500).json({
          success: false,
          message: 'Server configuration error: JWT secret missing.',
        });
        return;
      }

      // Explicitly type the secret as Secret (string | Buffer)
      const jwtSecret: Secret = Buffer.from(jwtSecretString);

      // Explicitly type the payload
      const payload: UserPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.verified,
      };

      // Explicitly type the options
      const signOptions: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']
      };

      // Generate JWT token with explicitly typed arguments
      const token = jwt.sign(
        payload,
        jwtSecret,
        signOptions
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async verifyEmail(req: Request<{}, ApiResponse, VerifyEmailRequest>, res: Response<ApiResponse>): Promise<void> {
    try {
      const { token } = req.body;

      // Find user with verification token
      const result = await pool.query(
        'SELECT id, name, email FROM users WHERE verification_token = $1 AND verified = FALSE',
        [token]
      );

      if (result.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token',
        });
        return;
      }

      const user = result.rows[0];

      // Update user as verified
      await pool.query(
        'UPDATE users SET verified = TRUE, verification_token = NULL WHERE id = $1',
        [user.id]
      );

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            verified: true,
          },
        },
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async requestPasswordReset(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { email } = req.body;

      // Find user
      const result = await pool.query(
        'SELECT id, name, email FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Don't reveal if email exists or not
        res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
        });
        return;
      }

      const user = result.rows[0];

      // Generate reset token
      const resetToken = EmailService.generateToken();
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
        [resetToken, resetTokenExpires, user.id]
      );

      // Send reset email
      await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async resetPassword(req: Request<{}, ApiResponse, ResetPasswordRequest>, res: Response<ApiResponse>): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      // Find user with valid reset token
      const result = await pool.query(
        'SELECT id, name, email FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
        return;
      }

      const user = result.rows[0];

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await pool.query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
        [passwordHash, user.id]
      );

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await pool.query(
        'SELECT id, name, email, verified, role, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const user = result.rows[0];

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name } = req.body;

      const result = await pool.query(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, verified, role',
        [name, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const user = result.rows[0];

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
