const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://wfdf.sport';
    const { data: response } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.query.limit ?? 100,
            _embed: 1,
        },
    });

    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        guid: item.guid.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        author: item._embedded.author[0].name,
    }));

    ctx.state.data = {
        title: 'WFDF News',
        link: `${baseUrl}/news/`,
        image: `${baseUrl}/favicon.ico`,
        description: 'WFDF 新闻',
        item: items,
    };
};
