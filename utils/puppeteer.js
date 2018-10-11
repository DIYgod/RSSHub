const config = require('../config');

const options = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certifcate-errors', '--ignore-certifcate-errors-spki-list', `--user-agent=${config.ua}`],
    headless: true,
    ignoreHTTPSErrors: true,
    userDataDir: './tmp',
};

module.exports = async () => {
    let browser;
    if (config.puppeteerWSEndpoint) {
        const puppeteer = require('puppeteer-core');
        browser = await puppeteer.connect({
            browserWSEndpoint: config.puppeteerWSEndpoint,
        });
    } else {
        const puppeteer = require('puppeteer');
        browser = await puppeteer.launch(options);
    }

    return browser;
};
