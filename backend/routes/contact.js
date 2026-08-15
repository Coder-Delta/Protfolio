import express from 'express';
import { body, validationResult } from 'express-validator';
import { query as dbQuery } from '../db/client.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages from this address. Please try again later.' },
});

// POST contact message
router.post(
  '/',
  contactLimiter,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
    body('email')
      .trim()
      .isEmail().withMessage('Invalid email address'),
    body('subject')
      .trim()
      .notEmpty().withMessage('Subject is required')
      .isLength({ min: 3, max: 255 }).withMessage('Subject must be between 3 and 255 characters'),
    body('message')
      .trim()
      .notEmpty().withMessage('Message is required')
      .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, subject, message } = req.body;

      // Insert message into database
      const result = await dbQuery(
        `INSERT INTO messages (name, email, subject, message) 
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        [name, email, subject, message]
      );

      res.status(201).json({
        success: true,
        message: 'Message received successfully',
        data: {
          id: result.rows[0].id,
          created_at: result.rows[0].created_at
        }
      });
    } catch (err) {
      console.error('Error saving message:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  }
);

export default router;
