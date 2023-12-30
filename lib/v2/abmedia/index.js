const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.abmedia.io';
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

module.exports = async (ctx) => {
    const limit = ctx.params.limit ?? 10;
    const url = `${postsAPIUrl}?per_page=${limit}`;

    const response = await got.get(url);
    const data = response.data;

    const items = data.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        description: item.content.rendered,
        pubDate: parseDate(item.date),
    }));

    ctx.state.data = {
        title: 'ABMedia - 最新消息',
        link: rootUrl,
        item: items,
    };
};
