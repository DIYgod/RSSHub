const puppeteerUtils = require('@/utils/puppeteer-utils');

/**
 * async function 获取cookie
 * @desc 返回一个可用的cookie，使用 `got` 发起请求的时候，传入到`options.headers.cookie`即可
 */
module.exports = async function getCookie(host) {
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });

    await page.goto(host, {
        waitUntil: 'networkidle0',
    });

    const cookie = await puppeteerUtils.getCookies(page);
    await browser.close();
    return cookie;
};
