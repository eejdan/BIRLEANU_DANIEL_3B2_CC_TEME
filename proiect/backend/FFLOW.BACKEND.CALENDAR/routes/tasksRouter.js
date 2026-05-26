import express from 'express';

import {
    completeTask,
    createTask,
    deleteTask,
    failTask,
    getTasks,
    updateTask
} from '../controllers/tasksController.js';

const router = express.Router();

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.patch('/:taskId/complete', completeTask);
router.patch('/:taskId/fail', failTask);

export default router;
