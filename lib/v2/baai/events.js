const got = require('@/utils/got');

const { baseUrl, apiHost, parseEventDetail, parseItem } = require('./utils');

module.exports = async (ctx) => {
    const responses = await got.all(
        Array.from(
            {
                // first 2 pages
                length: (ctx.query.limit ? parseInt(ctx.query.limit, 10) : 16) / 8,
            },
            (_, v) => `${apiHost}/api/v1/events?page=${v + 1}`
        ).map((url) => got.post(url))
    );

    const list = responses
        .map((response) => response.data.data)
        .flat()
        .map((item) => parseItem(item));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                item.description = await parseEventDetail(item);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '活动 - 智源社区',
        link: `${baseUrl}/events`,
        item: items,
    };
};
