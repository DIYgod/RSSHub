const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://acg17.com/';

module.exports = async (ctx) => {
    const response = await got(`${host}/wp-json/wp/v2/posts?per_page=30`);
    const list = response.data;

    const items = await Promise.all(
        list.map((item) => {
            const itemTitle = item.title.rendered;
            const itemDate = item.date;
            const itemUrl = item.link;
            const description = item.content.rendered;
            return ctx.cache.tryGet(itemUrl, () => ({
                title: itemTitle,
                link: itemUrl,
                pubDate: timezone(parseDate(itemDate), 8),
                description,
            }));
        })
    );

    ctx.state.data = {
        title: `ACG17 - 全部文章`,
        link: `${host}/blog`,
        description: 'ACG17 - 全部文章',
        item: items,
    };
};
