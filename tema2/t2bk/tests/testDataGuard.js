const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');
const usersPath = path.join(dataDir, 'users.json');
const userDataPath = path.join(dataDir, 'user_data.json');
const adminsPath = path.join(dataDir, 'admins.json');

function readIfExists(filePath) {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function writeSafe(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

function setupDataGuard() {
    const backup = {
        users: null,
        userData: null,
        admins: null
    };

    beforeAll(() => {
        backup.users = readIfExists(usersPath);
        backup.userData = readIfExists(userDataPath);
        backup.admins = readIfExists(adminsPath);
    });

    afterAll(() => {
        if (backup.users !== null) {
            writeSafe(usersPath, backup.users);
        }
        if (backup.userData !== null) {
            writeSafe(userDataPath, backup.userData);
        }
        if (backup.admins !== null) {
            writeSafe(adminsPath, backup.admins);
        }
    });

    const reset = () => {
        writeSafe(usersPath, '[]\n');
        writeSafe(userDataPath, '[]\n');
        writeSafe(adminsPath, JSON.stringify({ admins: [] }, null, 2));
    };

    return {
        reset,
        paths: {
            usersPath,
            userDataPath,
            adminsPath
        }
    };
}

module.exports = {
    setupDataGuard
};
