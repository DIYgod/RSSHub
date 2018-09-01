const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const {
        data: { data },
    } = await axios({
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
                        description: `${item.target.author.name}的回答<br/><br/>${item.target.content}`,
                        pubDate: new Date(item.created_time).toUTCString(),
                        link: `https://www.zhihu.com/question/${item.target.question.id}`,
                    };
                case 'article':
                    return {
                        title: item.target.title,
                        description: `${item.target.author.name}的文章<br/><br/>${item.target.content}`,
                        pubDate: new Date(item.created_time).toUTCString(),
                        link: `https://zhuanlan.zhihu.com/p/${item.target.id}`,
                    };
                default:
                    return {
                        title: '未知类型',
                        description: '请点击链接提交issue',
                        pubDate: new Date(item.created_time).toUTCString(),
                        link: 'https://github.com/DIYgod/RSSHub/issues',
                    };
            }
        }),
    };
};
