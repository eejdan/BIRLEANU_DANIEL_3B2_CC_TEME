const fs = require('node:fs');
const {
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
} = require('../src/dataStore');
const { setupDataGuard } = require('./testDataGuard');

const guard = setupDataGuard();

beforeEach(() => {
    guard.reset();
});

describe('dataStore module', () => {
    test('ensureDataFiles keeps data files available', () => {
        ensureDataFiles();
        expect(fs.existsSync(usersFile)).toBe(true);
        expect(fs.existsSync(userDataFile)).toBe(true);
        expect(fs.existsSync(adminsFile)).toBe(true);
    });

    test('save/get users and getUserById work', () => {
        const users = [{ id: 'u1', email: 'a@example.com' }];
        saveUsers(users);

        expect(getUsers()).toEqual(users);
        expect(getUserById('u1')).toEqual(users[0]);
        expect(getUserById('missing')).toBeNull();
    });

    test('save/get userData and create default userData by user id', () => {
        saveUserData([{ userId: 'u1', events: [], wakeupWeekly: {}, wakeupOverrides: {}, home: null }]);
        expect(getUserData()).toHaveLength(1);

        const created = getUserDataByUserId('u2');
        expect(created.userId).toBe('u2');
        expect(Array.isArray(created.events)).toBe(true);

        const all = getUserData();
        expect(all.find((entry) => entry.userId === 'u2')).toBeDefined();
    });

    test('upsertUserData updates and inserts', () => {
        upsertUserData({ userId: 'u1', events: [{ id: 1 }], wakeupWeekly: {}, wakeupOverrides: {}, home: null });
        let all = getUserData();
        expect(all).toHaveLength(1);

        upsertUserData({ userId: 'u1', events: [{ id: 2 }], wakeupWeekly: {}, wakeupOverrides: {}, home: null });
        all = getUserData();
        expect(all).toHaveLength(1);
        expect(all[0].events[0].id).toBe(2);
    });

    test('setAdmins/getAdmins normalizes and deduplicates', () => {
        setAdmins(['Admin@Example.com', 'admin@example.com', 'second@example.com']);
        expect(getAdmins()).toEqual(['admin@example.com', 'second@example.com']);
    });

    test('delete user and userData by id', () => {
        saveUsers([{ id: 'u1', email: 'a@example.com' }, { id: 'u2', email: 'b@example.com' }]);
        saveUserData([{ userId: 'u1' }, { userId: 'u2' }]);

        const deleted = deleteUserById('u1');
        expect(deleted.email).toBe('a@example.com');
        expect(deleteUserById('missing')).toBeNull();

        deleteUserDataByUserId('u2');
        expect(getUserData()).toEqual([{ userId: 'u1' }]);
    });
});
