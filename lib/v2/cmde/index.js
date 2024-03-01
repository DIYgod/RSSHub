const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const rootURL = 'https://www.cmde.org.cn';

module.exports = async (ctx) => {
    const cate = ctx.params.cate ?? 'xwdt/zxyw';
    const url = `${rootURL}/${cate}/`;
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const data = await ctx.cache.tryGet(url, async () => {
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
        });
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
        });
        await page.waitForSelector('.list');
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        await page.close();

        const $ = cheerio.load(html);

        return {
            title: $('head title').text(),
            description: $('meta[name=ColumnDescription]').attr('content'),
            items: $('.list ul li')
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        title: $(item).find('a').attr('title'),
                        link: new URL($(item).find('a').attr('href'), url).href,
                    };
                }),
        };
    });

    const items = await Promise.all(
        data.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
                });
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                await page.waitForSelector('.text');

                const html = await page.evaluate(() => document.documentElement.innerHTML);
                await page.close();
                const $ = cheerio.load(html);
                item.description = $('.text').html();
                item.pubDate = timezone(parseDate($('meta[name="PubDate"]').attr('content')), +8);
                return item;
            })
        )
    );

    await browser.close();

    ctx.state.data = {
        title: data.title,
        description: data.description,
        link: url,
        item: items,
    };
};
