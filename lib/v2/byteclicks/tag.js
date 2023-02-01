const got = require('@/utils/got');
const { parseItem } = require('./utils');
const baseUrl = 'https://byteclicks.com';

module.exports = async (ctx) => {
    const { tag } = ctx.params;
    const { data: search } = await got(`${baseUrl}/wp-json/wp/v2/tags`, {
        searchParams: {
            search: tag,
            per_page: 100,
        },
    });
    const tagData = search.find((item) => item.name === tag);

    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit) : 100,
            tags: tagData.id,
        },
    });

    const items = parseItem(data);

    ctx.state.data = {
        title: `${tagData.name} - 字节点击`,
        image: 'https://byteclicks.com/wp-content/themes/RK-Blogger/images/wbolt.ico',
        link: tagData.link,
        item: items,
    };
};
