import { config } from '@/config';
import puppeteer from 'puppeteer';
import logger from './logger';
import proxy from './proxy';
import proxyChain from 'proxy-chain';

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
    setTimeout(async () => {
        await browser.close();
    }, 30000);

    return browser;
};

export default outPuppeteer;
