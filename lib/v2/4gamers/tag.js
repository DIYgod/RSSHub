const got = require('@/utils/got');
const { parseList, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { tag } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit) : 25;

    const { data: response } = await got(`https://www.4gamers.com.tw/site/api/news/by-tag`, {
        searchParams: {
            tag,
            pageSize: limit,
        },
    });
    const list = parseList(response.data.results);

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => parseItem(item))));

    ctx.state.data = {
        title: `4Gamers - #${tag}`,
        link: `https://www.4gamers.com.tw/news/tag/${tag}`,
        item: items,
    };
};
