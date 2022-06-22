async function getContent(url, pptr = false) {
    if (pptr) {
        const browser = await require('@/utils/puppeteer')({ stealth: true });
        try {
            const page = await browser.newPage();
            // 更改 window.navigator.webdriver 值以避开反爬
            // await page.evaluateOnNewDocument(() => {
            //     // eslint-disable-next-line no-undef
            //     Object.defineProperty(navigator, 'webdriver', {
            //         get: () => undefined,
            //     });
            // });
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(url, {
                waitUntil: 'networkidle0',
            });
            const content = await page.content();
            return content;
        } finally {
            browser.close();
        }
    } else {
        const got = require('@/utils/got');
        const response = await got(url);
        const data = response.data;
        return data;
    }
}

module.exports = {
    getContent,
};
