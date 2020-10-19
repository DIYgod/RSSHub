const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get(`https://front-end-rss.now.sh/`);
    const $ = cheerio.load(response.data);
    const fn = Function($($('script')[1]).html() + 'return Array.isArray(LINKS_DATA) ? LINKS_DATA : []');
    const items = fn().reduce(
        (acc, category) => [
            ...acc,
            ...category.items.map((item) => ({
                link: item.link,
                pubDate: item.date,
                title: item.title,
                author: category.title,
                description: category.title,
            })),
        ],
        []
    );

    ctx.state.data = {
        title: '前端技术文章',
        link: 'https://front-end-rss.now.sh/',
        item: items,
    };
};
