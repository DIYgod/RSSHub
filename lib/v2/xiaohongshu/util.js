const config = require('@/config').value;
const logger = require('@/utils/logger');

const getUser = (url, cache) =>
    cache.tryGet(
        url,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            try {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                let otherInfo = '';
                let user_posted = '';
                let collect = '';
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' || request.resourceType() === 'other' ? request.continue() : request.abort();
                });
                page.on('response', async (response) => {
                    const request = response.request();
                    if (request.url().includes('/api/sns/web/v1/user/otherinfo')) {
                        otherInfo = await response.json();
                    }
                    if (request.url().includes('/api/sns/web/v1/user_posted')) {
                        user_posted = await response.json();
                    }
                    if (request.url().includes('/api/sns/web/v2/note/collect/page')) {
                        collect = await response.json();
                    }
                });
                logger.debug(`Requesting ${url}`);
                await page.goto(url);
                await page.waitForSelector('.feeds-container:nth-child(1) .note-item');
                await page.click('div.reds-tab-item:nth-child(2)');
                const privateCollection = await page.evaluate(() => document.querySelector('div.reds-tab-item:nth-child(2) .reds-icon'));
                if (!privateCollection) {
                    await page.waitForSelector('.feeds-container:nth-child(2) .note-item');
                }
                return { otherInfo, user_posted, collect };
            } finally {
                browser.close();
            }
        },
        config.cache.routeExpire,
        false
    );

const getBoard = (url, cache) =>
    cache.tryGet(
        url,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            try {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
                });
                logger.debug(`Requesting ${url}`);
                await page.goto(url);
                await page.waitForSelector('.pc-container');
                const initialSsrState = await page.evaluate(() => window.__INITIAL_SSR_STATE__);
                return initialSsrState.Main;
            } finally {
                browser.close();
            }
        },
        config.cache.routeExpire,
        false
    );

module.exports = {
    getUser,
    getBoard,
};
