const puppeteerGet = async (url, browser) => {
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    return html;
};

module.exports = {
    puppeteerGet,
};
