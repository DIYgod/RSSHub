const host = 'http://www.customs.gov.cn';

const puppeteerGet = async (url) => {
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    page.setExtraHTTPHeaders({ referer: host });
    await page.goto(url);
    await page.waitForSelector('.pubCon');
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    browser.close();
    return html;
};

module.exports = {
    host,
    puppeteerGet,
};
