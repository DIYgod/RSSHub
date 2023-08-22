const got = require('@/utils/got');
const auth = require('./auth');
const { generateData } = require('../pin/utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const xhuCookie = await auth.getCookie(ctx);
    const id = ctx.params.id;
    const link = `https://www.zhihu.com/collection/${id}`;

    const titleResponse = await got({
        method: 'get',
        url: `https://api.zhihuvvv.workers.dev/collections/${id}`,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });

    const contentResponse = await got({
        method: 'get',
        url: `https://api.zhihuvvv.workers.dev/collections/${id}/contents?limit=20&offset=0`,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });
    const listRes = contentResponse.data.data;

    ctx.state.data = {
        title: `知乎收藏夹-${titleResponse.data.title}`,
        description: titleResponse.data.description,
        link,
        item: listRes.map((item) => {
            const link = item.url;
            const author = item.author.name;
            const pubDate = parseDate(item.collect_time * 1000);
            let title = '';
            let description = '';

            // This API gets only article, answer and pin, not zvideo
            if (item.type === 'article') {
                title = item.title;
                description = item.excerpt;
            } else if (item.type === 'answer') {
                title = item.question.title;
                description = item.excerpt;
            } else if (item.type === 'pin') {
                const pinItem = generateData([item])[0];
                title = pinItem.title;
                description = pinItem.description;
            }

            return {
                title: `收藏了内容：${title}`,
                description,
                author,
                pubDate,
                guid: link,
                link,
            };
        }),
    };
};
