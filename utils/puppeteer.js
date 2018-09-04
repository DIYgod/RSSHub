const puppeteer = require('puppeteer');
const logger = require('./logger');
const config = require('../config');

const options = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certifcate-errors', '--ignore-certifcate-errors-spki-list', `--user-agent=${config.ua}`],
    headless: true,
    ignoreHTTPSErrors: true,
    userDataDir: './tmp',
};

module.exports = (async () => {
    const browser = await puppeteer.launch(options);
    logger.info('Puppeteer launched.');

    return async () => {
        const page = await browser.newPage();

        // 防止 page 未正确关闭，一分钟后自行关闭
        setTimeout(() => {
            page.close();
        }, 60000);

        return page;
    };
})();
