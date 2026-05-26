import express from 'express';

import {
    createFocusSession,
    createQuickNote,
    getFocusSessions,
    getQuickNotes
} from '../controllers/productivityController.js';

const focusSessionsRouter = express.Router();
const quickNotesRouter = express.Router();

focusSessionsRouter.get('/', getFocusSessions);
focusSessionsRouter.post('/', createFocusSession);

quickNotesRouter.get('/', getQuickNotes);
quickNotesRouter.post('/', createQuickNote);

export { focusSessionsRouter, quickNotesRouter };
