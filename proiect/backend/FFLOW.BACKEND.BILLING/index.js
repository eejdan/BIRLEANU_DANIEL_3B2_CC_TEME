import 'dotenv/config';

import connectDB from './config/db.js';
import createApp from './app.js';

const port = Number(process.env.PORT) || 3003;

async function startServer() {
    await connectDB();

    const app = createApp();
    return app.listen(port, () => {
        console.log(`Billing service listening on port ${port}`);
    });
}

const isDirectRun = process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url;

if (isDirectRun) {
    startServer().catch((error) => {
        console.error('Failed to start billing service', error);
        process.exit(1);
    });
}

export default startServer;
