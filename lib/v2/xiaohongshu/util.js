const config = require('@/config').value;

const getContent = (url, cache) =>
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
    getContent,
};
