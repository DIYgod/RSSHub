const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.geocaching.com';
    const { data: response } = await got(`${baseUrl}/blog/wp-json/wp/v2/posts`, {
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
        category: item._embedded['wp:term'][0].map((category) => category.name),
    }));

    ctx.state.data = {
        title: 'Geocaching Blog',
        link: `${baseUrl}/blog/`,
        image: `${baseUrl}/blog/favicon.ico`,
        description: 'Geocaching 博客更新',
        item: items,
    };
};
