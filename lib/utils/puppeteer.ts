import { config } from '@/config';
import puppeteer, { Browser, Page } from 'rebrowser-puppeteer';
import logger from './logger';
import proxy from './proxy';
import { anonymizeProxy } from 'proxy-chain';

/**
 * @deprecated use getPage instead
 * @returns Puppeteer browser
 */
const outPuppeteer = async () => {
    const options = {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-position=0,0',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            `--user-agent=${config.ua}`,
        ],
        headless: true,
        ignoreHTTPSErrors: true,
    };

    const insidePuppeteer: typeof puppeteer = puppeteer;

    const currentProxy = proxy.getCurrentProxy();
    if (currentProxy && proxy.proxyObj.url_regex === '.*') {
        if (currentProxy.urlHandler?.username || currentProxy.urlHandler?.password) {
            // only proxies with authentication need to be anonymized
            if (currentProxy.urlHandler.protocol === 'http:') {
                options.args.push(`--proxy-server=${await anonymizeProxy(currentProxy.uri)}`);
            } else {
                logger.warn('SOCKS/HTTPS proxy with authentication is not supported by puppeteer, continue without proxy');
            }
        } else {
            // Chromium cannot recognize socks5h and socks4a, so we need to trim their postfixes
            options.args.push(`--proxy-server=${currentProxy.uri.replace('socks5h://', 'socks5://').replace('socks4a://', 'socks4://')}`);
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
            waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
        };
        noGoto?: boolean;
    } = {}
) => {
    const options = {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-position=0,0',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            `--user-agent=${config.ua}`,
        ],
        headless: true,
        ignoreHTTPSErrors: true,
    };

    const insidePuppeteer: typeof puppeteer = puppeteer;

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
    let currentProxyState: any = null;
    const currentProxy = proxy.getCurrentProxy();
    if (currentProxy && allowProxy) {
        currentProxyState = currentProxy;
        if (currentProxy.urlHandler?.username || currentProxy.urlHandler?.password) {
            // only proxies with authentication need to be anonymized
            if (currentProxy.urlHandler.protocol === 'http:') {
                const urlObj = new URL(currentProxy.uri);
                urlObj.username = '';
                urlObj.password = '';
                options.args.push(`--proxy-server=${urlObj.toString().replace(/\/$/, '')}`);
                hasProxy = true;
            } else {
                logger.warn('SOCKS/HTTPS proxy with authentication is not supported by puppeteer, continue without proxy');
            }
        } else {
            // Chromium cannot recognize socks5h and socks4a, so we need to trim their postfixes
            options.args.push(`--proxy-server=${currentProxy.uri.replace('socks5h://', 'socks5://').replace('socks4a://', 'socks4://')}`);
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

    if (hasProxy && currentProxyState) {
        logger.debug(`Proxying request in puppeteer via ${currentProxyState.uri}: ${url}`);
    }

    if (hasProxy && currentProxyState && (currentProxyState.urlHandler?.username || currentProxyState.urlHandler?.password)) {
        await page.authenticate({
            username: currentProxyState.urlHandler?.username,
            password: currentProxyState.urlHandler?.password,
        });
    }

    if (instanceOptions.onBeforeLoad) {
        await instanceOptions.onBeforeLoad(page, browser);
    }

    if (!instanceOptions.noGoto) {
        try {
            await page.goto(url, instanceOptions.gotoConfig || { waitUntil: 'domcontentloaded' });
        } catch (error) {
            if (hasProxy && currentProxyState && proxy.multiProxy) {
                logger.warn(`Puppeteer navigation failed with proxy ${currentProxyState.uri}, marking as failed: ${error}`);
                proxy.markProxyFailed(currentProxyState.uri);
                throw error;
            }
            throw error;
        }
    }

    return {
        page,
        destory: async () => {
            await browser.close();
        },
        browser,
    };
};
