const got = require('@/utils/got');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 1;
    const { data } = await got(`https://api.dongqiudi.com/app/tabs/web/${id}.json`);
    const articles = data.articles;
    const label = data.label;

    const list = articles.map((item) => ({
        title: item.title,
        link: `https://www.dongqiudi.com/articles/${item.id}.html`,
        category: [item.category, ...(item.secondary_category ? item.secondary_category : [])],
        pubDate: parseDate(item.show_time),
    }));

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                utils.ProcessFeedType2(item, response);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `懂球帝 - ${label}`,
        link: `https://www.dongqiudi.com/articlesList/${id}`,
        item: out.filter((e) => e !== undefined),
    };
};
