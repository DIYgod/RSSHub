const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    let { subject = '' } = ctx.params;
    const host = 'https://m.chouti.com';

    if (subject === 'hot') {
        subject = '';
    }

    const response = await axios({
        method: 'get',
        url: `${host}/m/link/more.do?type=hot&subject=${subject}&limit=recent`,
        headers: {
            Referer: host,
        },
    });

    const resultItem = response.data.result.data.items.map((item) => ({
        title: item.title,
        author: item.nick,
        description: `${item.title}<br><img src="${item.originalImgUrl}" referrerpolicy="no-referrer" /><br><a href="${host}${item.commentsUrl}">评论</a>`,
        link: item.url,
        pubDate: new Date(item.createtime / 1000).toUTCString(),
    }));

    ctx.state.data = {
        title: '抽屉新热榜',
        description: '抽屉新热榜，汇聚每日搞笑段子、热门图片、有趣新闻。它将微博、门户、社区、bbs、社交网站等海量内容聚合在一起，通过用户推荐生成最热榜单。看抽屉新热榜，每日热门、有趣资讯尽收眼底。',
        link: host,
        item: resultItem,
    };
};
