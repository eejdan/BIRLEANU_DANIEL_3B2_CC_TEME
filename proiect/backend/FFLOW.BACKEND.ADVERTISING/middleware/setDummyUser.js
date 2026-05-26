import mongoose from 'mongoose';

const DUMMY_USER_ID = new mongoose.Types.ObjectId('111111111111111111111111');

function setDummyUser(req, res, next) {
    const requestedPlan = typeof req.headers['x-user-plan'] === 'string'
        ? req.headers['x-user-plan'].trim().toLowerCase()
        : 'free';

    req.user = {
        id: DUMMY_USER_ID,
        name: 'Dummy User',
        email: 'dummyuser@example.com',
        plan: requestedPlan === 'premium' ? 'premium' : 'free'
    };

    next();
}

export default setDummyUser;
