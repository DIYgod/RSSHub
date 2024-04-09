const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const feedId = ctx.params.id;
    const limit = ctx.query.limit ?? 30; // 默认30条

    const rootUrl = 'https://api-panda.com/v4/';
    const apiUrl = `${rootUrl}articles?feeds=${feedId}&limit=${limit}&page=1&sort=popular`;

    const { data } = await got(apiUrl);

    const items = data.map((item) => ({
        title: `${item.title} 🌟 ${item.source.likesCount}`,
        author: item.source.username,
        pubDate: parseDate(item.source.createdAt),
        link: item.source.targetUrl,
        description: item.description,
    }));

    ctx.state.data = {
        title: 'Panda Feeds',
        link: 'https://usepanda.com/',
        item: items,
    };
};
