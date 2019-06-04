const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const _url = `https://overreacted.io`;
    const { data } = await got.get(_url);
    const _$ = cheerio.load(data);

    const article = _$('main article').get();

    async function getDescription(url) {
        const cache = await ctx.cache.get(url);
        if (cache) {
            return cache;
        }

        const { data } = await got.get(url);
        const $ = cheerio.load(data);
        const main = $('main article')
            .children('div')
            .html();
        ctx.cache.set(url, main);
        return main;
    }

    // 使用 Promise.all() 进行 async 并发
    const item = await Promise.all(
        // 遍历每一篇文章
        article.map(async (item) => {
            const $ = cheerio.load(item);

            const $a = $('header h3 a');

            const title = $a.text();
            const link = `${_url}${$a.attr('href')}`;
            const pubDate = $('header small').text();
            const description = await getDescription(link);

            return Promise.resolve({
                title,
                description,
                link,
                guid: link,
                pubDate,
            });
        })
    );

    ctx.state.data = {
        title: 'Personal blog by Dan Abramov.',
        link: 'https://overreacted.io/',
        description: 'I explain with words and code.',
        item,
    };
};
