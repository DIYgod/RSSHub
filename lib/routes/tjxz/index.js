const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const md5 = require('@/utils/md5');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.tjxz.cc';
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        // 只允许 HTML 请求
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(baseUrl, {
        // 指定页面等待载入的时间
        waitUntil: 'domcontentloaded',
    });
    // 获取页面的 HTML 内容
    const response = await page.content();

    // 关闭标签页
    const $ = cheerio.load(response);
    const title = $('title').html();
    const list = $('article')
        .toArray()
        .map((single) => {
            const item = $(single);
            const name = item.find('div a').text().trim();
            return {
                title: name,
                author: '田间小站',
                link: item.find('div a').attr('href'),
                pubDate: parseDate(item.find('div span').text().trim(), 'YYYY年M月D日'),
                guid: md5(name),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('article .entry-content').first().html();

                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );

    page.close();
    browser.close();
    ctx.state.data = {
        title,
        link: baseUrl,
        item: items,
    };
};
