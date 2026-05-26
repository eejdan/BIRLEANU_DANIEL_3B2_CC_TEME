import express from 'express';

import authenticateUser from '../middleware/authenticateUser.js';
import {
    getCurrentUser,
    login,
    logout,
    register
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateUser, getCurrentUser);
router.post('/logout', authenticateUser, logout);

export default router;
