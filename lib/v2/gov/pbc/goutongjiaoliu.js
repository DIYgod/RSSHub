const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = 'http://www.pbc.gov.cn/goutongjiaoliu/113456/113469/index.html';

    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const html = await page.evaluate(() => document.documentElement.innerHTML);

    const $ = cheerio.load(html);
    const list = $('font.newslist_style')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), 'http://www.pbc.gov.cn').href,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailPage = await browser.newPage();
                await detailPage.setRequestInterception(true);
                detailPage.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
                });
                await detailPage.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const detailHtml = await detailPage.evaluate(() => document.documentElement.innerHTML);
                const content = cheerio.load(detailHtml);
                item.description = content('#zoom').html();
                item.pubDate = timezone(parseDate(content('.hui12').eq(5).text()), +8);
                return item;
            })
        )
    );

    browser.close();

    ctx.state.data = {
        title: '中国人民银行 - 沟通交流',
        link,
        item: items,
    };
};
