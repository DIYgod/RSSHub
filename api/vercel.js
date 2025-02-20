const path = require('path');
const moduleAlias = require('module-alias');
const chromium = require('@sparticuz/chromium');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));

const config = require('../lib/config');

// Configure chromium for Vercel
if (process.env.VERCEL) {
    config.set({
        NO_LOGFILES: true,
        PUPPETEER_WS_ENDPOINT: '',
        PUPPETEER_EXECUTABLE_PATH: await chromium.executablePath(),
        CHROME_BIN: await chromium.executablePath(),
        CHROMIUM_PATH: await chromium.executablePath(),
        PUPPETEER_BROWSER_OPTIONS: {
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        },
    });
} else {
    config.set({
        NO_LOGFILES: true,
    });
}

const app = require('../lib/app');

function handler(req, res) {
    app.callback()(req, res);
}

module.exports = handler;
