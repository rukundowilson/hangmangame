import express from 'express';
import { recordGame } from '../controllers/gameController.js';

const router = express.Router();

// Record game result
router.post('/record', recordGame);

export default router;



