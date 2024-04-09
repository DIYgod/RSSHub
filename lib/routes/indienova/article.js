const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let link = 'https://indienova.com/indie-game-news/';
    if (type === 'development') {
        link = 'https://indienova.com/indie-game-development/';
    }
    const response = await got.get(link);

    const host = 'https://indienova.com';

    const $ = cheerio.load(response.data);
    const list = $('.article-panel h4').get();

    const items = await Promise.all(
        list.map(async (item) => {
            const $$ = cheerio.load(item);
            const itemUrl = url.resolve(host, $$('a').attr('href'));
            const title = $$('a').text();

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const resp = await got.get(itemUrl);

            const $$$ = cheerio.load(resp.data);

            const description = $$$('.indienova-single-post').html();

            const single = {
                title,
                description,
                pubDate: '',
                link: itemUrl,
                author: '',
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'INDIENOVA',
        link: 'https://www.indienova.com/indie-game-news/',
        description: '独立游戏资讯 | indienova 独立游戏',
        item: items,
    };
};
