const puppeteerGet = async (url, browser) => {
    const isIndex = url.endsWith('/portal.php');
    const page = await browser.newPage();
    const expectResourceTypes = new Set(['document', 'script']);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        expectResourceTypes.has(request.resourceType()) ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    await (isIndex ? page.waitForSelector('.nex_recon_lists') : page.waitForSelector('.t_f'));
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    return html;
};

export { puppeteerGet };
