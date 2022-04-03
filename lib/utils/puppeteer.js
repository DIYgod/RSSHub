const config = require('@/config').value;
const puppeteer = require('puppeteer');

const options = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list', `--user-agent=${config.ua}`],
    headless: true,
    ignoreHTTPSErrors: true,
};

module.exports = async () => {
    let browser;
    if (config.puppeteerWSEndpoint) {
        browser = await puppeteer.connect({
            browserWSEndpoint: config.puppeteerWSEndpoint,
        });
    } else {
        browser = await puppeteer.launch(options);
    }
    setTimeout(() => {
        browser.close();
    }, 30000);

    return browser;
};
