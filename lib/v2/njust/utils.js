const delay = (timeout = 1000) => new Promise((resolve) => setTimeout(resolve, timeout));

async function getContent(url, pptr = false) {
    if (pptr) {
        const browser = await require('@/utils/puppeteer-extra')();
        try {
            const page = await browser.newPage();
            page.waitForNavigation({
                timeout: 20000,
            });
            // 更改 window.navigator.webdriver 值以避开反爬
            // await page.evaluateOnNewDocument(() => {
            //     // eslint-disable-next-line no-undef
            //     Object.defineProperty(navigator, 'webdriver', {
            //         get: () => undefined,
            //     });
            // });
            await page.goto(url);
            await delay(1000);
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
