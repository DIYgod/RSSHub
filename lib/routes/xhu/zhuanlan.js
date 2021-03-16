const got = require('@/utils/got');
const auth = require('./auth');
const utils = require('./utils');

module.exports = async (ctx) => {
    const xhu = await auth.Get();
    const id = String(ctx.params.id);

    const response = await got({
        method: 'get',
        url: `https://api.zhihu.com/columns/${id}/items?limit=20`,
        headers: xhu.headers,
    });
    const listRes = response.data.data;

    const info = await got({
        method: 'get',
        url: `https://api.zhihu.com/columns/${id}`,
        headers: xhu.headers,
    });

    const title = info.data.title;
    const description = info.data.description || info.data.title;

    const item = listRes.map((item) => {
        let title = '';
        let description = '';
        let link = '';
        let pubDate = '';
        let author = '';

        switch (item.type) {
            case 'article':
                title = item.title;
                description = item.content ? utils.ProcessImage(item.content) : item.excerpt;
                link = item.url ? item.url : `https://zhuanlan.zhihu.com/p/${item.id}`;
                pubDate = new Date(item.updated * 1000).toUTCString();
                author = item.author.name;
                break;
            case 'answer':
                title = `${item.question.title}-${item.author.name}的回答：${item.excerpt}`;
                description = `<strong>${item.question.title}</strong><br>${item.author.name}的回答<br/>${item.content ? utils.ProcessImage(item.content) : item.excerpt}`;
                link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`; // TODO
                pubDate = new Date(item.updated_time * 1000).toUTCString();
                author = item.author.name;
                break;
            case 'zvideo':
                title = item.title;
                description = item.description;
                link = `https://www.zhihu.com/zvideo/${item.video.video_id}`;
                pubDate = new Date(item.published_at * 1000).toUTCString();
                author = item.author.name;
                break;

            default:
                description = `未知类型 ${id}.${item.type}，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue`;
        }

        return {
            title,
            description,
            author,
            pubDate,
            guid: item.id.toString(),
            link,
        };
    });

    ctx.state.data = {
        description,
        item,
        title: `知乎专栏-${title}`,
        link: `https://zhuanlan.zhihu.com/${id}`,
    };
};
