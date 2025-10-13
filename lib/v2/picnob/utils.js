const puppeteerGet = async (url, browser) => {
    let data;
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    page.on('response', async (response) => {
        if (response.request().url().includes('/api/posts')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    await page.close();
    return data;
};

module.exports = {
    puppeteerGet,
};
