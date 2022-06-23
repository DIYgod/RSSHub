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
                let content = await page.content();

                content = content.replace('"RedAppLayout":undefined,', ''); // fix json parse
                const regex = /_SSR_STATE__\S*=([\s\S]+)<\/script>/gm;
                const match = regex.exec(content);
                return JSON.parse(match[1]).Main;
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
