const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const {
        data: { data },
    } = await got({
        method: 'get',
        url: 'https://www.zhihu.com/api/v3/explore/guest/feeds?limit=40',
    });

    ctx.state.data = {
        title: '知乎热榜',
        link: 'https://www.zhihu.com/billboard',
        description: '知乎热榜',
        item: data.map((item) => {
            switch (item.target.type) {
                case 'answer':
                    return {
                        title: item.target.question.title,
                        description: `${item.target.author.name}的回答<br/><br/>${utils.ProcessImage(item.target.content)}`,
                        author: item.target.author.name,
                        pubDate: new Date(item.target.updated_time * 1000).toUTCString(),
                        guid: item.target.id.toString(),
                        link: `https://www.zhihu.com/question/${item.target.question.id}/answer/${item.target.id}`,
                    };
                case 'article':
                    return {
                        title: item.target.title,
                        description: `${item.target.author.name}的文章<br/><br/>${utils.ProcessImage(item.target.content)}`,
                        author: item.target.author.name,
                        pubDate: new Date(item.updated * 1000).toUTCString(),
                        guid: item.target.id.toString(),
                        link: `https://zhuanlan.zhihu.com/p/${item.target.id}`,
                    };
                default:
                    return {
                        title: '未知类型',
                        description: '请点击链接提交issue',
                        pubDate: new Date().toUTCString(),
                        guid: item.target.type,
                        link: 'https://github.com/DIYgod/RSSHub/issues',
                    };
            }
        }),
    };
};
