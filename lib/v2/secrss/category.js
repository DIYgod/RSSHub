const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const api = 'https://www.secrss.com/api/articles?tag=';
    const { category = '' } = ctx.params;
    const host = 'https://www.secrss.com';
    const res = await got(`${api}${category}`);
    const dataArray = res.data.data;

    const items = await Promise.all(
        dataArray.map((item) => {
            const itemUrl = `${host}/articles/${item.id}`;
            return ctx.cache.tryGet(itemUrl, async () => {
                const result = await got(itemUrl);
                const $ = cheerio.load(result.data);
                const description = $('.article-body').html().trim();
                return {
                    title: item.title,
                    link: itemUrl,
                    pubDate: timezone(parseDate(item.published_at), 8),
                    description,
                    author: item.source_author,
                    category: item.tags.map((t) => t.title),
                };
            });
        })
    );

    ctx.state.data = {
        title: `安全内参-${category}`,
        link: 'https://www.secrss.com',
        item: items,
    };
};
