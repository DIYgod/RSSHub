const got = require('@/utils/got');

module.exports = async (ctx) => {
    const hour = ctx.params.hour || '24';

    const response = await got({
        method: 'get',
        url: `https://dig.chouti.com/top/${hour}hr?_=${+new Date()}`,
        headers: {
            Referer: 'https://dig.chouti.com/',
        },
    });

    const resultItem = response.data.data.map((item) => ({
        title: item.title,
        author: item.nick,
        description: `${item.title}<br><img src="${item.originalImgUrl || item.imgUrl || item.original_img_url || item.img_url}" /><br><a href="https://dig.chouti.com/link/${item.id}">评论</a>`,
        link: item.url,
        pubDate: new Date(item.created_time / 1000).toUTCString(),
    }));

    ctx.state.data = {
        title: `抽屉新热榜-${hour}小时最热榜`,
        description: '抽屉新热榜，汇聚每日搞笑段子、热门图片、有趣新闻。它将微博、门户、社区、bbs、社交网站等海量内容聚合在一起，通过用户推荐生成最热榜单。看抽屉新热榜，每日热门、有趣资讯尽收眼底。',
        link: 'https://dig.chouti.com/',
        item: resultItem,
    };
};
