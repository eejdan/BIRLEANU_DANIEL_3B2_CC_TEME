import express from 'express';

import authenticateUser from '../middleware/authenticateUser.js';
import {
    cancelSubscription,
    createCheckoutSession,
    getSubscription,
    receiveStripeWebhook,
    validatePremiumAccess
} from '../controllers/billingController.js';

const router = express.Router();

router.post('/stripe-webhook', receiveStripeWebhook);

router.use(authenticateUser);

router.get('/subscription', getSubscription);
router.post('/checkout-session', createCheckoutSession);
router.post('/cancel-subscription', cancelSubscription);
router.get('/premium-access', validatePremiumAccess);

export default router;
