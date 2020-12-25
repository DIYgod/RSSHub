const useragent = require('@/utils/useragent');

const host = 'http://aao.nuaa.edu.cn/';

/**
 * async function 获取cookie
 * @desc 返回一个可用的cookie，使用 `got` 发起请求的时候，传入到`options.header.cookie`即可
 */
module.exports = async function getCookie() {
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setUserAgent(useragent({ browserName: 'Chrome', osName: 'Windows' }));
    await page.evaluateOnNewDocument(() => {
        // eslint-disable-next-line
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(host, {
        waitUntil: 'networkidle0',
    });

    let cookie = await page.cookies();
    cookie = cookie.map(({ name, value }) => `${name}=${value}`).join('; ');
    await browser.close();
    return cookie;
};
