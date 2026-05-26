import express from 'express';

import {
    createWakeupOverride,
    deleteWakeupOverride,
    getWakeupSchedule,
    upsertWakeupSchedule
} from '../controllers/wakeupController.js';

const wakeupScheduleRouter = express.Router();
const wakeupOverrideRouter = express.Router();

wakeupScheduleRouter.get('/', getWakeupSchedule);
wakeupScheduleRouter.put('/', upsertWakeupSchedule);

wakeupOverrideRouter.post('/', createWakeupOverride);
wakeupOverrideRouter.delete('/:overrideId', deleteWakeupOverride);

export { wakeupOverrideRouter, wakeupScheduleRouter };
