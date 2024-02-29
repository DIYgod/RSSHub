import { config } from '@/config';
import puppeteer from 'puppeteer';
import logger from './logger';
import proxy from './proxy';

const proxyChain = require('proxy-chain');

import { type PuppeteerExtra, addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

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
const outPuppeteer = async (
    extraOptions: {
        stealth?: boolean;
    } = {}
) => {
    let insidePuppeteer: PuppeteerExtra | typeof puppeteer = puppeteer;
    if (extraOptions.stealth) {
        insidePuppeteer = addExtra(puppeteer);

        // workaround for vercel/nft #54, #283, #304
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

        insidePuppeteer.use(StealthPlugin());
    }

    if (proxy.proxyUri) {
        if (proxy.proxyUrlHandler?.username || proxy.proxyUrlHandler?.password) {
            // only proxies with authentication need to be anonymized
            if (proxy.proxyUrlHandler.protocol === 'http:') {
                options.args.push(`--proxy-server=${await proxyChain.anonymizeProxy(proxy.proxyUri)}`);
            } else {
                logger.warn('SOCKS/HTTPS proxy with authentication is not supported by puppeteer, continue without proxy');
            }
        } else {
            // Chromium cannot recognize socks5h and socks4a, so we need to trim their postfixes
            options.args.push(`--proxy-server=${proxy.proxyUri.replace('socks5h://', 'socks5://').replace('socks4a://', 'socks4://')}`);
        }
    }
    const browser = await (config.puppeteerWSEndpoint
        ? insidePuppeteer.connect({
              browserWSEndpoint: config.puppeteerWSEndpoint,
          })
        : insidePuppeteer.launch(
              config.chromiumExecutablePath
                  ? {
                        executablePath: config.chromiumExecutablePath,
                        ...options,
                    }
                  : options
          ));
    setTimeout(() => {
        browser.close();
    }, 30000);

    return browser;
};

export default outPuppeteer;
