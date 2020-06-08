const got = require('@/utils/got');
const cheerio = require('cheerio');
const date_util = require('@/utils/date');

module.exports = async (ctx) => {
    const link = `https://news.futunn.com/main`;

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(link);
    const html = await page.evaluate(
        // eslint-disable-next-line
        () => document.querySelector('div.news-list').innerHTML
    );
    browser.close();

    const $ = cheerio.load(html);

    const list = $('li.news-li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('.news-title').text(),
                link: $(this).find('a.news-link').attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                url: itemUrl,
                method: 'get',
                headers: {
                    Referer: link,
                },
            });

            const $ = cheerio.load(response.data);

            const description = $('div.newsDetailBox div.main div.inner').html() || '原文已被删除';

            const date = $('div.timeBar').text();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: date_util(date, 8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `富途牛牛要闻`,
        link: link,
        item: out,
    };
};
