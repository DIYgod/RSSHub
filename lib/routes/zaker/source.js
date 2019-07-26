const got = require('@/utils/got');
const cheerio = require('cheerio');
const date_util = require('@/utils/date');
const { addNoReferrer } = require('@/utils/common-utils');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'source';
    const id = ctx.params.id;
    const link = `http://www.myzaker.com/${type}/${id}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = $('a.nav_item_active').text();

    const list = $('div.figure.flex-block')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('h2 a')
                    .attr('title'),
                link: $(this)
                    .find('h2 a')
                    .attr('href'),
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

            addNoReferrer($, 'div.article_content div', 'data-original');

            const description = $('div.article_content div').html() || '原文已被删除';

            const date = $('span.time').text();

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
        title: `${title}-ZAKER新闻`,
        link: link,
        item: out,
    };
};
