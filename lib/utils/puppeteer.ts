import { config } from '@/config';
import puppeteer, { Browser, Page } from 'puppeteer';
import logger from './logger';
import proxy from './proxy';
import { anonymizeProxy } from 'proxy-chain';

import { type PuppeteerExtra, addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

/**
 * @deprecated use getPage instead
 * @param {Object} extraOptions
 * @param {boolean} extraOptions.stealth - Use puppeteer-extra-plugin-stealth
 * @returns Puppeteer browser
 */
const outPuppeteer = async (
    extraOptions: {
        stealth?: boolean;
    } = {}
) => {
    const options = {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list', `--user-agent=${config.ua}`],
        headless: true,
        ignoreHTTPSErrors: true,
    };

    let insidePuppeteer: PuppeteerExtra | typeof puppeteer = puppeteer;
    if (extraOptions.stealth) {
        insidePuppeteer = addExtra(puppeteer);
        insidePuppeteer.use(StealthPlugin());
    }

    if (proxy.proxyUri && proxy.proxyObj.url_regex === '.*') {
        if (proxy.proxyUrlHandler?.username || proxy.proxyUrlHandler?.password) {
            // only proxies with authentication need to be anonymized
            if (proxy.proxyUrlHandler.protocol === 'http:') {
                options.args.push(`--proxy-server=${await anonymizeProxy(proxy.proxyUri)}`);
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

/**
 * @returns Puppeteer page
 */
export const getPuppeteerPage = async (
    url: string,
    instanceOptions: {
        onBeforeLoad?: (page: Page, browser?: Browser) => Promise<void> | void;
        gotoConfig?: {
            waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0';
        };
        noGoto?: boolean;
    } = {}
) => {
    const options = {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list', `--user-agent=${config.ua}`],
        headless: true,
        ignoreHTTPSErrors: true,
    };

    let insidePuppeteer: PuppeteerExtra | typeof puppeteer = puppeteer;
    insidePuppeteer = addExtra(puppeteer);
    insidePuppeteer.use(StealthPlugin());

    let allowProxy = false;
    const proxyRegex = new RegExp(proxy.proxyObj.url_regex);
    let urlHandler;
    try {
        urlHandler = new URL(url);
    } catch {
        // ignore
    }

    if (proxyRegex.test(url) && url.startsWith('http') && !(urlHandler && urlHandler.host === proxy.proxyUrlHandler?.host)) {
        allowProxy = true;
    }

    let hasProxy = false;
    if (proxy.proxyUri && allowProxy) {
        if (proxy.proxyUrlHandler?.username || proxy.proxyUrlHandler?.password) {
            // only proxies with authentication need to be anonymized
            if (proxy.proxyUrlHandler.protocol === 'http:') {
                const urlObj = new URL(proxy.proxyUri);
                urlObj.username = '';
                urlObj.password = '';
                options.args.push(`--proxy-server=${urlObj.toString().replace(/\/$/, '')}`);
                hasProxy = true;
            } else {
                logger.warn('SOCKS/HTTPS proxy with authentication is not supported by puppeteer, continue without proxy');
            }
        } else {
            // Chromium cannot recognize socks5h and socks4a, so we need to trim their postfixes
            options.args.push(`--proxy-server=${proxy.proxyUri.replace('socks5h://', 'socks5://').replace('socks4a://', 'socks4://')}`);
            hasProxy = true;
        }
    }
    let browser: Browser;
    if (config.puppeteerWSEndpoint) {
        const endpointURL = new URL(config.puppeteerWSEndpoint);
        endpointURL.searchParams.set('launch', JSON.stringify(options));
        endpointURL.searchParams.set('stealth', 'true');
        const endpoint = endpointURL.toString();
        browser = await insidePuppeteer.connect({
            browserWSEndpoint: endpoint,
        });
    } else {
        browser = await insidePuppeteer.launch(
            config.chromiumExecutablePath
                ? {
                      executablePath: config.chromiumExecutablePath,
                      ...options,
                  }
                : options
        );
    }

    setTimeout(async () => {
        await browser.close();
    }, 30000);

    const page = await browser.newPage();

    if (hasProxy) {
        logger.debug(`Proxying request in puppeteer: ${url}`);
    }

    if (hasProxy && (proxy.proxyUrlHandler?.username || proxy.proxyUrlHandler?.password)) {
        await page.authenticate({
            username: proxy.proxyUrlHandler?.username,
            password: proxy.proxyUrlHandler?.password,
        });
    }

    if (instanceOptions.onBeforeLoad) {
        await instanceOptions.onBeforeLoad(page, browser);
    }

    if (!instanceOptions.noGoto) {
        await page.goto(url, instanceOptions.gotoConfig || { waitUntil: 'domcontentloaded' });
    }

    return {
        page,
        destory: async () => {
            await browser.close();
        },
        browser,
    };
};
