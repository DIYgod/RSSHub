const host = 'http://www.customs.gov.cn';

const playwrightGet = async (url, context) => {
    const page = await context.newPage();
    try {
        await page.setExtraHTTPHeaders({ referer: host });
        await page.route('**/*', async (route) => {
            const request = route.request();
            request.resourceType() === 'document' || request.resourceType() === 'script' ? await route.continue() : await route.abort();
        });
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
        });
        await page.waitForSelector('.news_list li, .news_detail_con, [class^="conList_ul"] li, .easysite-news-peruse');
        const html = await page.evaluate(() => document.documentElement.getHTML());
        return html;
    } finally {
        await page.close();
    }
};

export { host, playwrightGet };
