const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');
const config = require('@/config').value;
const baseUrl = 'https://www.nmpa.gov.cn';

module.exports = async (ctx) => {
    const path = ctx.params[0];
    const url = `${baseUrl}/${path.endsWith('/') ? path.slice(0, -1) : path}/index.html`;
    const browser = await require('@/utils/puppeteer')();
    const data = await ctx.cache.tryGet(
        url,
        async () => {
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
                            title: item.find('a').text().trim(),
                            link: new URL(item.find('a').attr('href'), baseUrl).href,
                            pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                        };
                    }),
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = await Promise.all(
        data.items.map((item) => {
            if (/^https:\/\/www\.nmpa\.gov\.cn\//.test(item.link)) {
                return ctx.cache.tryGet(item.link, async () => {
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
                    return item;
                });
            } else if (/^https:\/\/mp\.weixin\.qq\.com\//.test(item.link)) {
                return finishArticleItem(ctx, item);
            } else {
                return item;
            }
        })
    );

    await browser.close();

    ctx.state.data = {
        title: data.title,
        description: data.description,
        link: url,
        item: items,
    };
};
