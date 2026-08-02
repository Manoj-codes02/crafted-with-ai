import express from 'express';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getReports)
  .post(protect, createReport);

router.route('/:id')
  .get(getReportById)
  .put(protect, updateReport)
  .delete(protect, authorize('Admin'), deleteReport);

export default router;
