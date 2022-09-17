const config = require('@/config').value;
let puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');

const options = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list', `--user-agent=${config.ua}`],
    headless: true,
    ignoreHTTPSErrors: true,
};

let proxyUri;
if (config.proxyUri && typeof config.proxyUri === 'string') {
    proxyUri = config.proxyUri;
} else if (config.proxy && config.proxy.protocol && config.proxy.host && config.proxy.port) {
    proxyUri = `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`;
}

/**
 * @param {Object} extraOptions
 * @param {boolean} extraOptions.stealth - Use puppeteer-extra-plugin-stealth
 * @returns Puppeteer browser
 */
module.exports = async (extraOptions = {}) => {
    if (extraOptions.stealth) {
        const { addExtra } = require('puppeteer-extra');
        puppeteer = addExtra(puppeteer);

        // workaround for vercel/nft #54 and #283
        require('puppeteer-extra-plugin-stealth/evasions/chrome.app');
        require('puppeteer-extra-plugin-stealth/evasions/chrome.csi');
        require('puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes');
        require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime');
        require('puppeteer-extra-plugin-stealth/evasions/defaultArgs');
        require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow');
        require('puppeteer-extra-plugin-stealth/evasions/media.codecs');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.languages');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver');
        require('puppeteer-extra-plugin-stealth/evasions/sourceurl');
        require('puppeteer-extra-plugin-stealth/evasions/user-agent-override');
        require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor');
        require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions');
        require('puppeteer-extra-plugin-user-preferences');
        require('puppeteer-extra-plugin-user-data-dir');

        puppeteer.use(require('puppeteer-extra-plugin-stealth')());
    }
    let browser;
    if (proxyUri) {
        options.args.push(`--proxy-server=${await proxyChain.anonymizeProxy(proxyUri)}`);
    }
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
