const cheerio = require('cheerio');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const targetUrl = 'https://ielts.neea.cn/allnews?locale=zh_CN';

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        const proto = navigator.__proto__;
        delete proto.webdriver;
    });

    await page.goto(targetUrl, {
        waitUntil: 'networkidle0',
    });
    const list = await page.evaluate(() =>
        window
            .$('#newsListUl li')
            .get()
            .map((elem) => {
                const $elem = window.$(elem);
                return {
                    title: $elem.find('a').text(),
                    link: $elem.find('a').attr('href'),
                    pubDate: $elem.find('span').eq(-1).text().replace(/[[\]]/g, '').trim(),
                };
            })
    );
    browser.close();

    list.sort((a, b) => parseDate(b.pubDate) - parseDate(a.pubDate));
    list.forEach((item) => {
        item.pubDate = timezone(parseDate(item.pubDate), +8);
    });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(detailResponse.data);
                item.description = $('.content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'IELTS雅思最新消息',
        link: targetUrl,
        item: items,
    };
};
