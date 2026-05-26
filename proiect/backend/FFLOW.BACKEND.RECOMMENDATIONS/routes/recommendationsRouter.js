import express from 'express';

import {
    autoArrangeTasks,
    createCommuteSuggestion,
    getAnalyticsLeaderboard,
    getAnalyticsSummary,
    getFreeTimePreferences,
    recalculateCommuteSuggestion,
    suggestFreeTimeActivity,
    upsertFreeTimePreferences
} from '../controllers/recommendationsController.js';

const router = express.Router();

router.post('/commute', createCommuteSuggestion);
router.post('/commute/recalculate', recalculateCommuteSuggestion);
router.post('/tasks/auto-arrange', autoArrangeTasks);
router.get('/analytics/summary', getAnalyticsSummary);
router.get('/analytics/leaderboard', getAnalyticsLeaderboard);
router.get('/free-time/preferences', getFreeTimePreferences);
router.put('/free-time/preferences', upsertFreeTimePreferences);
router.post('/free-time/suggest', suggestFreeTimeActivity);

export default router;
