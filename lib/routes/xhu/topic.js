const got = require('@/utils/got');
const auth = require('./auth');

module.exports = async (ctx) => {
    const xhu = await auth.Get();
    const { topicId } = ctx.params;

    const response = await got({
        method: 'get',
        url: `https://api.zhihu.com/topics/${topicId}/feeds/timeline_activity?limit=20`,
        headers: xhu.headers,
    });
    const listRes = response.data.data;

    const info = await got({
        method: 'get',
        url: `https://api.zhihu.com/topics/${topicId}`,
        headers: xhu.headers,
    });

    ctx.state.data = {
        title: `知乎话题-${info.data.name ? info.data.name : topicId}`,
        link: `https://www.zhihu.com/topic/${topicId}/newest`,
        item: listRes.map((item) => {
            const type = item.type;
            let title = '';
            let description = '';
            let link = '';
            let pubDate = '';
            let author = '';

            switch (type) {
                case 'answer':
                    title = `${item.question.title}-${item.author.name}的回答：${item.excerpt}`;
                    description = `<strong>${item.question.title}</strong><br>${item.author.name}的回答<br/>${item.excerpt}`;
                    link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`; // TODO
                    pubDate = new Date(item.updated_time * 1000).toUTCString();
                    author = item.author.name;
                    break;

                case 'question':
                    title = item.title;
                    description = item.title;
                    link = `https://www.zhihu.com/question/${item.id}`;
                    pubDate = new Date(item.created * 1000).toUTCString();
                    break;

                default:
                    description = `未知类型 ${topicId}.${type}，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue`;
            }

            return {
                title,
                description,
                author,
                pubDate,
                guid: item.id.toString(),
                link,
            };
        }),
    };
};
