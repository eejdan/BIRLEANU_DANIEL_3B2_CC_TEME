const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, '..', 'data', 'admins.json');

function readAdmins() {
    if (!fs.existsSync(filePath)) {
        return { admins: [] };
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(data.admins)) {
        return { admins: [] };
    }
    return { admins: data.admins.map((email) => String(email).toLowerCase()) };
}

function writeAdmins(admins) {
    fs.writeFileSync(filePath, JSON.stringify({ admins }, null, 2), 'utf8');
}

function validateEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function main() {
    const command = process.argv[2];
    const emailArg = process.argv[3] ? String(process.argv[3]).toLowerCase() : null;
    const payload = readAdmins();

    if (command === 'list') {
        console.log(JSON.stringify(payload, null, 2));
        return;
    }

    if (!validateEmail(emailArg)) {
        console.error('Provide a valid email. Usage: node scripts/admins.js add|remove email@example.com');
        process.exit(1);
    }

    if (command === 'add') {
        if (!payload.admins.includes(emailArg)) {
            payload.admins.push(emailArg);
            writeAdmins(payload.admins);
        }
        console.log(JSON.stringify({ success: true, admins: payload.admins }, null, 2));
        return;
    }

    if (command === 'remove') {
        const filtered = payload.admins.filter((email) => email !== emailArg);
        writeAdmins(filtered);
        console.log(JSON.stringify({ success: true, admins: filtered }, null, 2));
        return;
    }

    console.error('Unknown command. Use add, remove, or list.');
    process.exit(1);
}

main();