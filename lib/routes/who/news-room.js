const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const date = require('@/utils/date');

const host = 'https://www.who.int/';

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const link = url.resolve('https://www.who.int/zh/news-room/', type);
    const response = await got.get(encodeURI(link));
    const $ = cheerio.load(response.data);

    const list = $('div.list-view--item');
    const title = $('ul.sf-breadscrumb.breadcrumb li.active').text();
    const out = await Promise.all(
        list
            .map(async (index, elem) => {
                const $elem = $(elem);
                const title = $elem.find('p').text();
                const link = url.resolve(host, $elem.find('a').attr('href'));
                const pubDate = date($elem.find('.timestamp').text());

                const item = {
                    title,
                    pubDate,
                    link: encodeURI(link),
                };

                const key = link;
                const value = await ctx.cache.get(key);
                if (value) {
                    item.description = value;
                } else {
                    const detail = await got.get(item.link);
                    const data = detail.data;
                    const $ = cheerio.load(data);

                    item.description = $('article')
                        .html()
                        .replace(/src="\//g, `src="${host}`);
                    ctx.cache.set(key, item.description);
                }

                return item;
            })
            .get()
    );

    ctx.state.data = {
        title: `世界卫生组织媒体中心-${title}`,
        link,
        item: out,
    };
};
