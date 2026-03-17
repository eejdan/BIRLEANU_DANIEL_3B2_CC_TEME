const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { setupDataGuard } = require('./testDataGuard');

const guard = setupDataGuard();
const projectRoot = path.join(__dirname, '..');
const scriptPath = path.join(projectRoot, 'scripts', 'admins.js');

beforeEach(() => {
    guard.reset();
});

function runScript(args) {
    return spawnSync(process.execPath, [scriptPath, ...args], {
        cwd: projectRoot,
        encoding: 'utf8'
    });
}

describe('scripts/admins.js', () => {
    test('list returns current payload', () => {
        const result = runScript(['list']);
        expect(result.status).toBe(0);
        const payload = JSON.parse(result.stdout);
        expect(payload).toEqual({ admins: [] });
    });

    test('add stores lowercase admin and does not duplicate', () => {
        let result = runScript(['add', 'ADMIN@Example.com']);
        expect(result.status).toBe(0);
        let payload = JSON.parse(result.stdout);
        expect(payload.admins).toEqual(['admin@example.com']);

        result = runScript(['add', 'admin@example.com']);
        payload = JSON.parse(result.stdout);
        expect(payload.admins).toEqual(['admin@example.com']);
    });

    test('remove deletes admin entry', () => {
        runScript(['add', 'admin@example.com']);
        const result = runScript(['remove', 'admin@example.com']);
        expect(result.status).toBe(0);
        const payload = JSON.parse(result.stdout);
        expect(payload.admins).toEqual([]);
    });

    test('invalid email returns exit code 1', () => {
        const result = runScript(['add', 'bad-email']);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('Provide a valid email');
    });

    test('unknown command returns exit code 1', () => {
        const result = runScript(['unknown', 'admin@example.com']);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('Unknown command');
    });

    test('script updates admins json file', () => {
        runScript(['add', 'admin@example.com']);
        const content = JSON.parse(fs.readFileSync(guard.paths.adminsPath, 'utf8'));
        expect(content.admins).toEqual(['admin@example.com']);
    });
});
