const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://www.dealmoon.com/cn/stores/${id}?sort=relevance&exp=n`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = $('.data-dmt-d-store-name').text();

    const list = $('span.j-stat-count-share stat-count-share')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('.data-title').text(),
                link: $(this).find('.data-pagelink'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = 'http:' + info.link;

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

            const description = $('div.article_content div').html() || '原文已被删除';

            const date = $('span.time').text();

            const single = {
                title,
                link: itemUrl,
                description,
                //pubDate: timezone(parseRelativeDate(date), +8),
                pubDate: parseRelativeDate(date),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${title}-beimei`,
        link,
        item: out,
    };
};
