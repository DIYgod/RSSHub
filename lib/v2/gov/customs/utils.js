const host = 'http://www.customs.gov.cn';

const puppeteerGet = async (url, browser) => {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ referer: host });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('.pubCon');
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    return html;
};

module.exports = {
    host,
    puppeteerGet,
};
