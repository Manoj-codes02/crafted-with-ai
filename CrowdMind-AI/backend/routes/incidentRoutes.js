import express from 'express';
import {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
} from '../controllers/incidentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getIncidents)
  .post(protect, createIncident);

router.route('/:id')
  .get(getIncidentById)
  .put(protect, updateIncident)
  .delete(protect, authorize('Admin'), deleteIncident);

export default router;
