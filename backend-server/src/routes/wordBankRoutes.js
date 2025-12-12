import express from 'express';
import { createWordBank, getUserWordBanks, deleteWordBank } from '../controllers/wordBankController.js';

const router = express.Router();

// Create custom word bank
router.post('/create', createWordBank);

// Get user's word banks
router.get('/list', getUserWordBanks);

// Delete word bank
router.delete('/delete', deleteWordBank);

export default router;

