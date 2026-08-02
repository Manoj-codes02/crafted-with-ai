import express from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resourceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getResources)
  .post(protect, authorize('Admin'), createResource);

router.route('/:id')
  .get(getResourceById)
  .put(protect, updateResource)
  .delete(protect, authorize('Admin'), deleteResource);

export default router;
