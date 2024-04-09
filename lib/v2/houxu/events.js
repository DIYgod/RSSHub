const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://houxu.app';
    const apiUrl = `${rootUrl}/api/1/events?limit=${ctx.query.limit ?? 50}`;
    const currentUrl = `${rootUrl}/events`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.map((item) => ({
        guid: `${rootUrl}/events/${item.id}#${item.last_thread.id}`,
        title: item.title,
        link: `${rootUrl}/events/${item.id}`,
        author: item.creator.name,
        category: item.tags,
        pubDate: parseDate(item.update_at),
        description: art(path.join(__dirname, 'templates/events.art'), {
            title: item.title,
            description: item.description,
            linkTitle: item.last_thread.link_title,
            content: item.last_thread.title.replace(/\r\n/g, '<br>'),
            pubDate: item.update_at,
        }),
    }));

    ctx.state.data = {
        title: '后续 - 专栏',
        link: currentUrl,
        item: items,
    };
};
