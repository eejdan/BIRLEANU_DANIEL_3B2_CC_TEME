import FocusSession from '../models/FocusSession.js';
import QuickNote from '../models/QuickNote.js';
import { serializeFocusSession, serializeQuickNote } from '../lib/serializers.js';
import { parseDate, parseFocusSession, parsePositiveInteger, parseQuickNote } from '../lib/validation.js';

async function getQuickNotes(req, res) {
    const limit = parsePositiveInteger(req.query.limit, 'limit', 10);
    const date = req.query.date ? parseDate(req.query.date, 'date') : null;
    const filter = { owner: req.user.id };

    if (date) {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
    }

    const notes = await QuickNote.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit);

    res.status(200).json(notes.map(serializeQuickNote));
}

async function createQuickNote(req, res) {
    const payload = parseQuickNote(req.body);

    const note = await QuickNote.create({
        ...payload,
        owner: req.user.id
    });

    res.status(201).json({ note: serializeQuickNote(note) });
}

async function getFocusSessions(req, res) {
    const limit = parsePositiveInteger(req.query.limit, 'limit', 10);
    const startDate = req.query.startDate ? parseDate(req.query.startDate, 'startDate') : null;
    const endDate = req.query.endDate ? parseDate(req.query.endDate, 'endDate') : null;
    const filter = { owner: req.user.id };

    if (startDate || endDate) {
        filter.startTime = {};
        if (startDate) {
            filter.startTime.$gte = startDate;
        }
        if (endDate) {
            filter.startTime.$lte = endDate;
        }
    }

    const sessions = await FocusSession.find(filter)
        .sort({ startTime: -1, createdAt: -1 })
        .limit(limit);

    res.status(200).json(sessions.map(serializeFocusSession));
}

async function createFocusSession(req, res) {
    const payload = parseFocusSession(req.body);

    const session = await FocusSession.create({
        ...payload,
        owner: req.user.id
    });

    res.status(201).json({ session: serializeFocusSession(session) });
}

export {
    createFocusSession,
    createQuickNote,
    getFocusSessions,
    getQuickNotes
};
