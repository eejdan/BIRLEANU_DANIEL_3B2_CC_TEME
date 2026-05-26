import express from 'express';

import {
    getAd,
    getEligibility,
    recordClick,
    recordImpression
} from '../controllers/advertisingController.js';

const router = express.Router();

router.get('/eligibility', getEligibility);
router.get('/ad', getAd);
router.post('/impression', recordImpression);
router.post('/click', recordClick);

export default router;
