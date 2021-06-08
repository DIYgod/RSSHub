const got = require("@/utils/got");

module.exports = async(ctx) => {
    const category = ctx.params.category || '';
    let categoryName = '全部消息';
    switch (category) {
        case 'news':
            categoryName = '游戏新闻';
            break;
        case 'notice':
            categoryName = '游戏公告';
            break;
        case 'activity':
            categoryName = '活动';
            break;
    }

    const response = await got.post('https://mole.leiting.com/news/load', {
        json: {
            category,
            page: 1,
        }
    });
    const data = response.data.list;

    ctx.state.data = {
        title: `摩尔庄园 - ${categoryName}`,
        link:  `https://mole.leiting.com/news`,
        description: '摩尔庄园游戏动态',
        item: data.map((item) => ({
            title: item.title,
            description: item.resume,
            pubDate: item.publish_time,
            link: `https://mole.leiting.com/news/${item.id}`
        })),
    };
};