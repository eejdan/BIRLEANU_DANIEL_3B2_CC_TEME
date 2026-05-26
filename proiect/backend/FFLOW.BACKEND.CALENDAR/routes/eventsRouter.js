import express from 'express';

import {
    completeEvent,
    createEvent,
    deleteEvent,
    failEvent,
    getEventById,
    getEvents,
    updateEvent,
    updateEventAlarm
} from '../controllers/eventsController.js';

const router = express.Router();

router.post('/', createEvent);
router.get('/', getEvents);
router.get('/:eventId', getEventById);
router.put('/:eventId', updateEvent);
router.delete('/:eventId', deleteEvent);
router.put('/:eventId/alarm', updateEventAlarm);
router.patch('/:eventId/complete', completeEvent);
router.patch('/:eventId/fail', failEvent);

export default router;
