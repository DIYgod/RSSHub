const host = 'http://www.customs.gov.cn';

const playwrightGet = async (url, context) => {
    const page = await context.newPage();
    await page.setExtraHTTPHeaders({ referer: host });
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('.pubCon');
    const html = await page.evaluate(() => document.documentElement.getHTML());
    return html;
};

export { host, playwrightGet };
