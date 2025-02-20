const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));

const config = require('../lib/config');
config.set({
    NO_LOGFILES: true,
    PUPPETEER_WS_ENDPOINT: '',
    CHROMIUM_EXECUTABLE_PATH: '/tmp/chromium',
    CHROME_BIN: '/tmp/chromium',
});

// Configure puppeteer for Vercel
if (process.env.VERCEL) {
    process.env.PUPPETEER_BROWSER = 'chrome-aws-lambda';
    process.env.PUPPETEER_EXECUTABLE_PATH = '/tmp/chromium';
}

const app = require('../lib/app');

module.exports = (req, res) => {
    app.callback()(req, res);
};
