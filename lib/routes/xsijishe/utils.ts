const puppeteerGet = async (url, browser) => {
    const page = await browser.newPage();
    const expectResourceTypes = new Set(['document', 'script']);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        expectResourceTypes.has(request.resourceType()) ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    let html;
    html = await page.evaluate(() => document.documentElement.innerHTML);
    if (html.includes('抱歉，您尚未登录，没有权限访问该版块')) {
        await page.close();
        return html;
    }

    await page.waitForSelector('.t_f');
    html = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    return html;
};

export { puppeteerGet };
