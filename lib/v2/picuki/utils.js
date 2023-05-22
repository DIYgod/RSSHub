const puppeteerGet = async (url, browser) => {
    const page = await browser.newPage();
    // await page.setExtraHTTPHeaders({ referer: host });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('.wrapper');

    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    return html;
};

module.exports = {
    puppeteerGet,
};
