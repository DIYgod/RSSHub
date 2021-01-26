const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseIndexUrl = 'https://www.sice.uestc.edu.cn/index.htm';
    const host = 'https://www.sice.uestc.edu.cn/';
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();

    // 浏览器伪装
    await page.evaluateOnNewDocument(() => {
        // 在每个新页面打开前执行以下脚本
        const newProto = navigator.__proto__;
        delete newProto.webdriver; // 删除navigator.webdriver字段
        navigator.__proto__ = newProto;
        window.chrome = {}; // 添加window.chrome字段，为增加真实性还需向内部填充一些值
        window.chrome.app = { InstallState: 'hehe', RunningState: 'haha', getDetails: 'xixi', getIsInstalled: 'ohno' };
        window.chrome.csi = function () {};
        window.chrome.loadTimes = function () {};
        window.chrome.runtime = function () {};
        Object.defineProperty(navigator, 'userAgent', {
            // userAgent在无头模式下有headless字样，所以需覆写
            get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36',
        });
        Object.defineProperty(navigator, 'plugins', {
            // 伪装真实的插件信息
            get: () => [{ description: 'Portable Document Format', filename: 'internal-pdf-viewer', length: 1, name: 'Chrome PDF Plugin' }],
        });
        Object.defineProperty(navigator, 'languages', {
            // 添加语言
            get: () => ['zh-CN', 'zh', 'en'],
        });
        const originalQuery = window.navigator.permissions.query; // notification伪装
        window.navigator.permissions.query = (parameters) => (parameters.name === 'notifications' ? Promise.resolve({ state: Notification.permission }) : originalQuery(parameters));
    });

    await page.goto(baseIndexUrl, {
        waitUntil: 'networkidle0',
    });
    const content = await page.content();
    await browser.close();
    const $ = cheerio.load(content);

    const out = $('.notice p')
        .map((index, item) => {
            item = $(item);
            let date = new Date(new Date().getFullYear() + '-' + item.find('a.date').text());
            if (new Date() < date) {
                date = new Date(new Date().getFullYear() - 1 + '-' + item.find('a.date').text());
            }
            return {
                title: item.find('a[href]').text(),
                link: host + item.find('a[href]').attr('href'),
                pubDate: date,
            };
        })
        .get();

    ctx.state.data = {
        title: '信通通知公告',
        link: 'https://www.sice.uestc.edu.cn/tzgg/yb.htm',
        description: '电子科技大学信息与通信工程学院通知公告',
        item: out,
    };
};
