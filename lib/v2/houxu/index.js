const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://houxu.app';
    const apiUrl = `${rootUrl}/api/1/records/index?limit=${ctx.query.limit ?? 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.map((item) => ({
        guid: `${rootUrl}/lives/${item.object.id}#${item.object.last.id}`,
        title: item.object.title,
        link: `${rootUrl}/lives/${item.object.id}`,
        author: item.object.last.link.source ?? item.object.last.link.media.name,
        pubDate: parseDate(item.object.news_update_at),
        description: art(path.join(__dirname, 'templates/lives.art'), {
            title: item.object.title,
            description: item.object.summary,
            url: item.object.last.link.url,
            linkTitle: item.object.last.link.title,
            source: item.object.last.link.source ?? item.object.last.link.media.name,
            content: item.object.last.link.description.replace(/\r\n/g, '<br>'),
            pubDate: item.object.news_update_at,
        }),
    }));

    ctx.state.data = {
        title: '后续 - 热点',
        link: rootUrl,
        item: items,
    };
};
