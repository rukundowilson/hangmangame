import express from 'express';
import { registerUser, getUserStats, updateActiveWordBank } from '../controllers/userController.js';

const router = express.Router();

// Register user
router.post('/register', registerUser);

// Get user statistics
router.get('/stats', getUserStats);

// Update active word bank
router.post('/active-word-bank', updateActiveWordBank);

export default router;


