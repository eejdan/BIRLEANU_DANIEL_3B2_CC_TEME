import mongoose from 'mongoose';

const DUMMY_USER_ID = new mongoose.Types.ObjectId('111111111111111111111111');

function setDummyUser(req, res, next) {
    req.user = {
        id: DUMMY_USER_ID,
        name: 'Dummy User',
        email: 'dummyuser@example.com'
    };

    next();
}

export default setDummyUser;
