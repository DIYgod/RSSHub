// @ts-nocheck
const dayjs = require('dayjs');
const { constructTopicEntry } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const topicUrl = `https://m.okjike.com/topics/${id}`;

    const data = await constructTopicEntry(ctx, topicUrl);

    if (data) {
        const result = ctx.get('data');
        result.item = data.posts.map((item) => {
            const date = dayjs(item.createdAt);
            return {
                title: `${data.topic.content} ${date.format('MM月DD日')}`,
                description: item.content.replaceAll('\n', '<br>'),
                pubDate: date.toDate(),
                link: `https://m.okjike.com/originalPosts/${item.id}`,
            };
        });
        ctx.set('data', result);
    }
};
