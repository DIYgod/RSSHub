const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const feedId = ctx.params.id;

    const rootUrl = 'https://api-panda.com/v4/';
    const apiUrl = `${rootUrl}articles?feeds=${feedId}&limit=30&page=1&sort=popular`;

    const { data } = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = data.map((item) => ({
        title: `${item.title} 🌟 ${item.source.likesCount}`,
        author: item.source.username,
        pubDate: parseDate(item.source.createdAt),
        link: item.source.targetUrl,
        description: item.description,
        category: item.tags,
    }));

    ctx.state.data = {
        title: `Panda Feed`,
        link: apiUrl,
        item: items,
    };
};
