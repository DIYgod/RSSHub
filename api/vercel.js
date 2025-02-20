// api/vercel.js
const path = require('path');
const moduleAlias = require('module-alias');
const chromium = require('@sparticuz/chromium');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));

const config = require('../lib/config');
const app = require('../lib/app');

// Initialize configuration asynchronously
async function initializeConfig() {
    if (process.env.VERCEL) {
        const execPath = await chromium.executablePath();
        config.set({
            NO_LOGFILES: true,
            PUPPETEER_WS_ENDPOINT: '',
            PUPPETEER_EXECUTABLE_PATH: execPath,
            CHROME_BIN: execPath,
            CHROMIUM_PATH: execPath,
            PUPPETEER_BROWSER_OPTIONS: {
                args: chromium.args,
                executablePath: execPath,
                headless: chromium.headless,
            },
        });
    } else {
        config.set({
            NO_LOGFILES: true,
        });
    }
}

// Handler function that ensures config is initialized
async function handler(req, res) {
    try {
        await initializeConfig();
        return app.callback()(req, res);
    } catch (error) {
        // Option 1: Disable ESLint for this specific line
        // eslint-disable-next-line no-console
        console.error('Initialization error:', error);

        // Option 2: Use a proper logger if available in your app
        // logger.error('Initialization error:', error);

        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
}

module.exports = handler;
