const puppeteerGet = async (url, browser) => {
    const page = await browser.newPage();
    const expectResourceTypes = new Set(['document', 'script', 'xhr', 'fetch']);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        expectResourceTypes.has(request.resourceType()) ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('.content');

    const html = await page.content();
    await page.close();
    return html;
};

export { puppeteerGet };
