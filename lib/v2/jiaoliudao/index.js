const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.jiaoliudao.com';
    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30,
        },
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
        link: item.link,
    }));

    ctx.state.data = {
        title: '交流岛资源网-专注网络资源收集',
        image: `${baseUrl}/favicon.ico`,
        link: baseUrl,
        item: items,
    };
};
