import Task from '../models/Task.js';
import { serializeTask } from '../lib/serializers.js';
import { ensure } from '../lib/http.js';
import { parseCreateTask, parseDate, parseObjectId, parseUpdateTask } from '../lib/validation.js';

async function createTask(req, res) {
    const payload = parseCreateTask(req.body);
    const task = await Task.create({
        ...payload,
        owner: req.user.id
    });

    res.status(201).json({ task: serializeTask(task) });
}

async function getTasks(req, res) {
    const queryDate = parseDate(req.query.date, 'date');
    const startOfDay = new Date(queryDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const tasks = await Task.find({
        owner: req.user.id,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).sort({ date: 1, createdAt: 1 });

    res.status(200).json(tasks.map(serializeTask));
}

async function updateTask(req, res) {
    const taskId = parseObjectId(req.params.taskId, 'taskId');
    const task = await Task.findOne({
        _id: taskId,
        owner: req.user.id
    });

    ensure(task, 404, 'Task not found');

    const payload = parseUpdateTask(req.body);
    Object.assign(task, payload);
    if (payload.completed === true) {
        task.failedAt = null;
    }
    if ('date' in payload || 'estimatedMinutes' in payload) {
        task.failedAt = null;
    }
    await task.save();

    res.status(200).json({ task: serializeTask(task) });
}

async function deleteTask(req, res) {
    const taskId = parseObjectId(req.params.taskId, 'taskId');
    const task = await Task.findOneAndDelete({
        _id: taskId,
        owner: req.user.id
    });

    ensure(task, 404, 'Task not found');
    res.status(200).json({ message: 'Task deleted successfully' });
}

async function completeTask(req, res) {
    const taskId = parseObjectId(req.params.taskId, 'taskId');
    const task = await Task.findOne({
        _id: taskId,
        owner: req.user.id
    });

    ensure(task, 404, 'Task not found');

    task.completed = true;
    task.completedAt = new Date();
    task.failedAt = null;
    await task.save();

    res.status(200).json({ task: serializeTask(task) });
}

async function failTask(req, res) {
    const taskId = parseObjectId(req.params.taskId, 'taskId');
    const task = await Task.findOne({
        _id: taskId,
        owner: req.user.id
    });

    ensure(task, 404, 'Task not found');

    task.completed = false;
    task.completedAt = null;
    task.failedAt = new Date();
    await task.save();

    res.status(200).json({ task: serializeTask(task) });
}

export {
    completeTask,
    createTask,
    deleteTask,
    failTask,
    getTasks,
    updateTask
};
