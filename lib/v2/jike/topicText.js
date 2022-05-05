const dayjs = require('dayjs');
const { constructTopicEntry } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const topicUrl = `https://m.okjike.com/topics/${id}`;

    const data = await constructTopicEntry(ctx, topicUrl);

    if (data) {
        ctx.state.data.item = data.posts.map((item) => {
            const date = dayjs(item.createdAt);
            return {
                title: `${data.topic.content} ${date.format('MM月DD日')}`,
                description: item.content.replace(/\n/g, '<br>'),
                pubDate: date.toDate(),
                link: `https://m.okjike.com/originalPosts/${item.id}`,
            };
        });
    }
};
