const puppeteerGet = async (url, browser, includeStories = false) => {
    const page = await browser.newPage();
    const expectResourceTypes = includeStories ? ['document', 'script', 'xhr'] : ['document'];
    // await page.setExtraHTTPHeaders({ referer: host });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        expectResourceTypes.includes(request.resourceType()) ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('.wrapper');
    if (includeStories) {
        await page.$eval('.show_stories_button', (btn) => btn.click());
        await page.waitForSelector('.stories_container .content');
    }

    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    return html;
};

module.exports = {
    puppeteerGet,
};
