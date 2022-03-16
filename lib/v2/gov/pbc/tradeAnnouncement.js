const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = 'http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/index.html';

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(link);
    const html = await page.evaluate(
        () =>
            // eslint-disable-next-line
            document.querySelector('body').innerHTML
    );
    const $ = cheerio.load(html);
    const list = $('font.newslist_style')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), 'http://www.pbc.gov.cn'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailPage = await browser.newPage();
                await detailPage.goto(item.link);
                const detailHtml = await detailPage.evaluate(
                    () =>
                        // eslint-disable-next-line
                        document.querySelector('body').innerHTML
                );
                const content = cheerio.load(detailHtml);
                item.description = content('#zoom').html();
                item.pubDate = timezone(parseDate(content('#shijian').text()), +8);
                return item;
            })
        )
    );

    browser.close();

    ctx.state.data = {
        title: '中国人民银行 - 货币政策司公开市场交易公告',
        link,
        item: items,
    };
};
