const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');
const userDataFile = path.join(dataDir, 'user_data.json');
const adminsFile = path.join(dataDir, 'admins.json');

function ensureDataFiles() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, '[]', 'utf8');
    }
    if (!fs.existsSync(userDataFile)) {
        fs.writeFileSync(userDataFile, '[]', 'utf8');
    }
    if (!fs.existsSync(adminsFile)) {
        fs.writeFileSync(adminsFile, JSON.stringify({ admins: [] }, null, 2), 'utf8');
    }
}

function readJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || 'null');
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getUsers() {
    return readJson(usersFile);
}

function saveUsers(users) {
    writeJson(usersFile, users);
}

function getUserData() {
    return readJson(userDataFile);
}

function saveUserData(userData) {
    writeJson(userDataFile, userData);
}

function getAdmins() {
    const payload = readJson(adminsFile);
    return Array.isArray(payload?.admins)
        ? payload.admins.map((email) => String(email).toLowerCase())
        : [];
}

function setAdmins(adminEmails) {
    writeJson(adminsFile, {
        admins: Array.from(new Set(adminEmails.map((email) => String(email).toLowerCase())))
    });
}

function getUserById(userId) {
    return getUsers().find((user) => user.id === userId) || null;
}

function getUserDataByUserId(userId) {
    const all = getUserData();
    const found = all.find((entry) => entry.userId === userId);
    if (found) {
        return found;
    }
    const empty = {
        userId,
        home: null,
        wakeupWeekly: {
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            saturday: null,
            sunday: null
        },
        wakeupOverrides: {},
        events: []
    };
    all.push(empty);
    saveUserData(all);
    return empty;
}

function upsertUserData(nextEntry) {
    const all = getUserData();
    const index = all.findIndex((entry) => entry.userId === nextEntry.userId);
    if (index >= 0) {
        all[index] = nextEntry;
    } else {
        all.push(nextEntry);
    }
    saveUserData(all);
}

function deleteUserById(userId) {
    const users = getUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index < 0) {
        return null;
    }
    const deleted = users[index];
    users.splice(index, 1);
    saveUsers(users);
    return deleted;
}

function deleteUserDataByUserId(userId) {
    const data = getUserData();
    const filtered = data.filter((entry) => entry.userId !== userId);
    saveUserData(filtered);
}

module.exports = {
    ensureDataFiles,
    getUsers,
    saveUsers,
    getUserData,
    saveUserData,
    getAdmins,
    setAdmins,
    getUserById,
    getUserDataByUserId,
    upsertUserData,
    deleteUserById,
    deleteUserDataByUserId,
    usersFile,
    userDataFile,
    adminsFile
};