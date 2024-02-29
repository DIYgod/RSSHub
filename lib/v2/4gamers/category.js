const got = require('@/utils/got');
const { parseList, parseItem, getCategories } = require('./utils');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit) : 25;
    const isLatest = !category;

    const { data: response } = await got(`https://www.4gamers.com.tw/site/api/news/${isLatest ? 'latest' : `by-category/${category}`}`, {
        searchParams: {
            nextStart: 0,
            pageSize: limit,
        },
    });
    const list = parseList(response.data.results);

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => parseItem(item))));

    let categories = [];
    let categoryName = '最新消息';
    if (!isLatest) {
        categories = await getCategories(ctx.cache.tryGet);
        categoryName = categories.find((c) => c.id === Number.parseInt(category)).name;
    }

    ctx.state.data = {
        title: `4Gamers - ${categoryName}`,
        link: `https://www.4gamers.com.tw/news${isLatest ? '' : `/category/${category}/${categoryName}`}`,
        item: items,
    };
};
