const got = require('@/utils/got');

module.exports = async (ctx) => {
    const cid = Number(ctx.params.category);

    const categories = ['精选', '人物', '静物', '二次元', '黑白', '自然', '美食', '电影与游戏', '科技与艺术', '城市与建筑', '萌物', '美女'];

    const host = 'https://www.dgtle.com';

    const response = await got({
        method: 'get',
        url: `https://opser.api.dgtle.com/v1/whale/index?category_id=${cid}&page=1&per-page=10`,
    });

    const items = response.data.items.map((item) => ({
        title: item.content,
        pubDate: new Date(item.updated_at * 1000).toUTCString(),
        author: item.author.username,
        description: `<img src=${item.attachment.pic_url.split('?')[0]} />`,
        link: item.attachment.pic_url.split('?')[0],
    }));

    ctx.state.data = {
        title: `数字尾巴 - 鲸图 - ${categories[cid]}`,
        description: '分类鲸图',
        link: host,
        item: items,
    };
};
