import express from 'express';

import { seedDatabase, wipeDatabase } from './lib/seeder.js';

function renderPage() {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FocusFlow DB Seeder</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b1326;
      --panel: #132039;
      --panel-2: #1d2b48;
      --text: #f3f5fb;
      --muted: #aeb8cf;
      --accent: #7dd3fc;
      --danger: #fca5a5;
      --success: #86efac;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: radial-gradient(circle at top, #173157 0%, var(--bg) 58%);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: min(760px, 100%);
      background: rgba(19, 32, 57, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 22px;
      padding: 28px;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
    }
    h1 { margin: 0 0 10px; font-size: 30px; }
    p { color: var(--muted); line-height: 1.6; }
    .actions {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin: 24px 0;
    }
    button {
      border: 0;
      border-radius: 999px;
      padding: 14px 22px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 120ms ease, opacity 120ms ease;
    }
    button:hover { transform: translateY(-1px); }
    button:disabled { opacity: 0.5; cursor: wait; transform: none; }
    .seed { background: var(--accent); color: #082032; }
    .wipe { background: var(--danger); color: #3b1111; }
    .status {
      min-height: 52px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 16px;
      padding: 16px;
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 13px;
      line-height: 1.5;
    }
    .meta {
      display: grid;
      gap: 10px;
      margin-top: 24px;
      padding: 18px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
    }
    code {
      color: var(--success);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>FocusFlow Dev DB Seeder</h1>
    <p>This developer-only service can wipe all Mongo collections with <code>deleteMany({})</code> and repopulate realistic demo data for every domain.</p>
    <div class="actions">
      <button class="wipe" id="wipe">Wipe database</button>
      <button class="seed" id="seed">Seed demo data</button>
    </div>
    <div class="status" id="status">Ready.</div>
    <section class="meta">
      <div>Free accounts: <code>andrei.popescu@focusflow.local</code>, <code>bianca.matei@focusflow.local</code></div>
      <div>Premium account: <code>teodora.ilie@focusflow.local</code></div>
      <div>Password for all seeded accounts: <code>testpass123</code></div>
      <div>Seeder is available only on its direct port and is not proxied through nginx.</div>
    </section>
  </main>
  <script>
    const status = document.getElementById('status');
    const buttons = {
      wipe: document.getElementById('wipe'),
      seed: document.getElementById('seed')
    };

    async function runAction(path, label) {
      buttons.wipe.disabled = true;
      buttons.seed.disabled = true;
      status.textContent = label + '...';

      try {
        const response = await fetch(path, { method: 'POST' });
        const payload = await response.json();
        status.textContent = JSON.stringify(payload, null, 2);
      } catch (error) {
        status.textContent = 'Request failed: ' + error.message;
      } finally {
        buttons.wipe.disabled = false;
        buttons.seed.disabled = false;
      }
    }

    buttons.wipe.addEventListener('click', () => runAction('/admin/wipe', 'Wiping database'));
    buttons.seed.addEventListener('click', () => runAction('/admin/seed', 'Seeding database'));
  </script>
</body>
</html>`;
}

function createApp() {
    const app = express();
    app.use(express.json());

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.get('/', (req, res) => {
        res.type('html').send(renderPage());
    });

    app.post('/admin/wipe', async (req, res, next) => {
        try {
            const result = await wipeDatabase();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    app.post('/admin/seed', async (req, res, next) => {
        try {
            const result = await seedDatabase();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    app.use((error, req, res, next) => {
        if (res.headersSent) {
            next(error);
            return;
        }

        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || 'Internal server error'
        });
    });

    return app;
}

export default createApp;
