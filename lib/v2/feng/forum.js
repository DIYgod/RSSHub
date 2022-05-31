const { parseDate } = require('@/utils/parse-date');
const { baseUrl, getForumMeta, getThreads, getThread } = require('./utils');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const topicId = Number(ctx.params.id);
    const { type = 'all' } = ctx.params;

    const forumMeta = await getForumMeta(topicId, ctx);
    const topicMeta = forumMeta.dataList.find((data) => data.topicId === topicId);
    const threads = (await getThreads(topicId, type, ctx)).data.dataList.map((data) => ({
        title: data.title,
        pubDate: parseDate(data.dateline * 1000),
        author: data.userBaseInfo.userName,
        link: `${baseUrl}/post/${data.tid}`,
        tid: data.tid,
    }));

    const posts = await Promise.all(
        threads.map(async (item) => {
            const thread = await getThread(item.tid, topicId, ctx);
            if (thread.status.code === 0) {
                const img = art(path.join(__dirname, 'templates/img.art'), {
                    images: thread.data.thread.fengTalkImage.length ? thread.data.thread.fengTalkImage : undefined,
                });
                item.description = thread.data.thread.message + img;
            } else {
                item.description = art(path.join(__dirname, 'templates/deleted.art'), {});
            }
            delete item.tid;
            return item;
        })
    );

    ctx.state.data = {
        title: `${topicMeta.topicName} - 社区 - 威锋 - 千万果粉大本营`,
        description: topicMeta.topicDescription,
        link: `${baseUrl}/forum/${topicId}`,
        item: posts,
    };
};
