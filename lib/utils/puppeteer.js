const config = require('@/config').value;
let puppeteer = require('puppeteer');

const options = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list', `--user-agent=${config.ua}`],
    headless: true,
    ignoreHTTPSErrors: true,
};

/**
 * @param {Object} extraOptions
 * @param {boolean} extraOptions.stealth - Use puppeteer-extra-plugin-stealth
 * @returns Puppeteer browser
 */
module.exports = async (extraOptions = {}) => {
    if (extraOptions.stealth) {
        const { addExtra } = require('puppeteer-extra');
        puppeteer = addExtra(puppeteer);
        puppeteer.use(require('puppeteer-extra-plugin-stealth')());
    }
    let browser;
    if (config.puppeteerWSEndpoint) {
        browser = await puppeteer.connect({
            browserWSEndpoint: config.puppeteerWSEndpoint,
        });
    } else {
        browser = await puppeteer.launch(
            config.chromiumExecutablePath
                ? {
                      executablePath: config.chromiumExecutablePath,
                      ...options,
                  }
                : options
        );
    }
    setTimeout(() => {
        browser.close();
    }, 30000);

    return browser;
};
