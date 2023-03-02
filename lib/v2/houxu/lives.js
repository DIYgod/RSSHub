const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://houxu.app';
    const apiUrl = `${rootUrl}/api/1/lives/${id}`;
    const currentUrl = `${rootUrl}/lives/${id}`;

    const pageResponse = await got({
        method: 'get',
        url: apiUrl,
    });

    const response = await got({
        method: 'get',
        url: `${apiUrl}/threads?limit=${ctx.query.limit ?? 500}`,
    });

    const items = response.data.results.map((item) => ({
        title: item.link.title,
        link: item.link.url,
        author: item.link.source ?? item.link.media.name,
        pubDate: parseDate(item.create_at),
        description: item.link.description,
    }));

    ctx.state.data = {
        title: `后续 - ${pageResponse.data.title}`,
        link: currentUrl,
        item: items,
        description: pageResponse.data.summary,
    };
};
