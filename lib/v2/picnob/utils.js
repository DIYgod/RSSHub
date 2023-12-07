const puppeteerGet = async (url) => {
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();
    await browser.close();
    return html;
};

module.exports = {
    puppeteerGet,
};
