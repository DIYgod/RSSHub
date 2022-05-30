const cheerio = require('cheerio');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const targetUrl = 'https://ielts.neea.cn/allnews?locale=zh_CN';
const config = require('@/config').value;

module.exports = async (ctx) => {
    const html = await ctx.cache.tryGet(
        targetUrl,
        async () => {
            const browser = await require('@/utils/puppeteer')({ stealth: true });
            const page = await browser.newPage();

            await page.goto(targetUrl);
            await page.waitForSelector('div.container');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            browser.close();
            return html;
        },
        config.cache.routeExpire,
        false
    );

    const $ = cheerio.load(html);

    const list = $('#newsListUl li')
        .get()
        .map((elem) => {
            const $elem = $(elem);
            return {
                title: $elem.find('a').text(),
                link: $elem.find('a').attr('href'),
                pubDate: timezone(parseDate($elem.find('span').eq(-1).text().replace(/[[\]]/g, '').trim(), +8)),
            };
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
