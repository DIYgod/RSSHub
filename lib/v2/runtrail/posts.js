const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://runtrail.cn';
    const { data: response } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            _embed: true,
            per_page: ctx.query.limit ? parseInt(ctx.query.limit) : 30,
        },
    });

    let data = response;
    if (typeof response !== 'object') {
        // remove php warnings before JSON
        data = JSON.parse(response.match(/\[(.*)\]/)[0]);
    }

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
        author: item._embedded.author.map((a) => a.name).join(', '),
        category: item._embedded['wp:term'][0].map((c) => c.name),
        link: item.link,
    }));

    ctx.state.data = {
        title: '最新文章 - 跑野大爆炸',
        link: baseUrl,
        item: items,
    };
};
