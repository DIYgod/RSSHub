const got = require('@/utils/got');

module.exports = async (ctx) => {
    const subject = ctx.params.subject || 'hot';
    const host = 'https://m.chouti.com';
    let api = `${host}/api/m/zone/${subject}?afterTime=0`;
    let pageUrl = `https://m.chouti.com/zone/${subject}`;
    if (subject === 'hot') {
        api = `${host}/api/m/link/hot?afterTime=0`;
        pageUrl = `https://m.chouti.com/all/hot`;
    }

    const response = await got({
        method: 'get',
        url: api,
        headers: {
            Referer: host,
        },
    });

    const resultItem = response.data.data.map((item) => ({
        title: item.title,
        author: item.nick,
        description: `${item.title}<br><img src="${item.originalImgUrl || item.imgUrl || item.original_img_url || item.img_url}" /><br><a href="${host}/link/${item.id}">评论</a>`,
        link: item.url,
        pubDate: new Date(item.created_time / 1000).toUTCString(),
    }));

    ctx.state.data = {
        title: '抽屉新热榜',
        description: '抽屉新热榜，汇聚每日搞笑段子、热门图片、有趣新闻。它将微博、门户、社区、bbs、社交网站等海量内容聚合在一起，通过用户推荐生成最热榜单。看抽屉新热榜，每日热门、有趣资讯尽收眼底。',
        link: pageUrl,
        item: resultItem,
    };
};
