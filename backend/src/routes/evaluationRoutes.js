// routes/evaluationRoutes.js
import express from 'express';
import {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluationStatus,
  getDocument,
} from '../controllers/evaluationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/evaluations - Create new evaluation
router.post('/', createEvaluation);

// GET /api/evaluations - Get all evaluations
router.get('/', getEvaluations);

// GET /api/evaluations/:id - Get single evaluation
router.get('/:id', getEvaluationById);

// PATCH /api/evaluations/:id/status - Update status (admin only)
router.patch('/:id/status', updateEvaluationStatus);

// GET /api/evaluations/:evaluationId/documents/:documentId - Download document
router.get('/:evaluationId/documents/:documentId', getDocument);

export default router;
