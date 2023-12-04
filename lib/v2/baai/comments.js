const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const { baseUrl, apiHost } = require('./utils');

module.exports = async (ctx) => {
    const responses = await got.all(
        Array.from(
            {
                // first 2 pages
                length: (ctx.query.limit ? parseInt(ctx.query.limit, 10) : 12) / 6,
            },
            (_, v) => `${apiHost}/api/v1/commentsall?page=${v + 1}`
        ).map((url) => got.post(url))
    );

    const items = responses
        .map((response) => response.data.data.list)
        .flat()
        .map((item) => ({
            title: `${item.user_info.name} ${item.title_desc} ${item.title}`,
            description: item.desc,
            pubDate: timezone(parseDate(item.created_at), +8),
            author: item.user_info.name,
            link: `${baseUrl}/view/${item.source_id || item.story_id}`,
            guid: `baai:hub:comments:${item.id}`,
        }));

    ctx.state.data = {
        title: '评论 - 智源社区',
        link: `${baseUrl}/comments`,
        item: items,
    };
};
