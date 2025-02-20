// api/vercel.js
const path = require('path');
const moduleAlias = require('module-alias');
const chromium = require('@sparticuz/chromium');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));

const config = require('../lib/config');
const logger = require('../lib/utils/logger');
const app = require('../lib/app');

// Initialize configuration asynchronously
async function initializeConfig() {
    if (process.env.VERCEL) {
        const execPath = await chromium.executablePath();
        const browserConfig = {
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
        };

        config.set(browserConfig);
        logger.info('Vercel environment configured', browserConfig);
    } else {
        config.set({
            NO_LOGFILES: true,
        });
        logger.info('Local environment configured');
    }
}

// Handler function that ensures config is initialized
async function handler(req, res) {
    try {
        await initializeConfig();
        logger.debug('Request received', {
            method: req.method,
            path: req.url,
        });

        return app.callback()(req, res);
    } catch (error) {
        logger.error('Initialization error', {
            error: error.message,
            stack: error.stack,
            details: error,
        });

        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
}

module.exports = handler;
