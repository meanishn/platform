import { Router } from 'express';
import { requestController } from '../controllers/requestController';
import { dashboardController } from '../controllers/dashboardController';
import { requireApprovedProvider } from '../middleware/authMiddleware';

const router = Router();

/**
 * PROVIDER JOB DISCOVERY ROUTES
 * These routes help providers discover and view available opportunities
 */

// Get jobs provider can accept (status: eligible or notified, request status: pending)
// Returns jobs with matching metadata (matchScore, distanceMiles, rank)
router.get('/available-jobs', requireApprovedProvider, requestController.getAvailableJobs);

// ROUTE NAME CHANGE RECOMMENDATION:
// Consider renaming to '/jobs/pending-selection' for clarity
// Get jobs provider accepted but customer hasn't selected yet (status: accepted, request status: pending)
// Returns jobs waiting for customer decision
router.get('/accepted-jobs', requireApprovedProvider, requestController.getAcceptedPendingJobs);

// Get provider's cancelled jobs with matching metadata (all cancelled_* statuses)
// Useful for history and analytics
router.get('/cancelled-jobs', requireApprovedProvider, requestController.getCancelledJobs);

/**
 * PROVIDER ASSIGNMENT ROUTES
 * These routes manage the provider's active work assignments
 */

// UNIFIED PROVIDER ACTION ENDPOINT ✨ NEW
// Single endpoint for all provider actions: accept, decline, start, complete, cancel
// POST body: { action: 'accept' | 'decline' | 'start' | 'complete' | 'cancel', reason?: string }
router.post('/requests/:id/action', requireApprovedProvider, requestController.providerAction);

// ROUTE NAME CHANGE RECOMMENDATION:
// This route name is clear - returns all assignments filtered by status
// Status can be: assigned, in_progress, completed
router.get('/assignments', requireApprovedProvider, requestController.getProviderAssignments);


// Decline an available job (marks as rejected)
router.patch('/assignments/decline', requireApprovedProvider, requestController.declineAssignment);

/**
 * PROVIDER REQUEST DETAILS ROUTES
 */

// Get provider-specific job details with match metadata and progressive customer disclosure
// This endpoint is optimized for provider views - no assignedProvider confusion
router.get('/requests/:id', requireApprovedProvider, requestController.getProviderJobDetails);

/**
 * PROVIDER DASHBOARD ROUTES
 */

// Get provider statistics (earnings, ratings, job counts, etc.)
router.get('/dashboard/stats', requireApprovedProvider, dashboardController.getProviderStats);

// Get provider activity feed (recent jobs, notifications, etc.)
router.get('/dashboard/requests', requireApprovedProvider, dashboardController.getProviderActivity);

export default router;
