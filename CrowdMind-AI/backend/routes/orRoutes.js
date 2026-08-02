import express from 'express';
import { getOptimizedAllocation, dispatchAllocations } from '../controllers/orController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/optimize', protect, getOptimizedAllocation);
router.post('/dispatch', protect, authorize('Admin', 'RescueTeam'), dispatchAllocations);

export default router;
