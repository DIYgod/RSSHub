const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const subpath = ctx.params.subpath;
    const base = 'http://international.xjtu.edu.cn';

    const url = `${base}/${subpath.split('.')[0]}.htm`;
    const resp = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(resp.data);
    const name = $('div.pageTitle').text();
    const list = $('.news-list-a > .c').get();

    const item = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('p.list-tit');
            const pubDate = $('p.list-time');
            const link = new URL($('a').attr('href'), base).href;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const resp = await got.get(link);

            const $Des = cheerio.load(resp.data);
            const description = $Des('div.ctnCont').html();

            const rssItem = {
                title: title.text(),
                link,
                pubDate: new Date(pubDate.text()),
                description,
            };

            ctx.cache.set(rssItem, JSON.stringify(rssItem));
            return Promise.resolve(rssItem);
        })
    );

    ctx.state.data = {
        title: `西安交通大学国际处 - ${name}`,
        link: url,
        description: `西安交通大学国际处 - ${name}`,
        item,
    };
};
