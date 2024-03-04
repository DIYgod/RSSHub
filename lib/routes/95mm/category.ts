// @ts-nocheck
const { rootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const categories = {
        1: '清纯唯美',
        2: '摄影私房',
        4: '明星写真',
        5: '三次元',
        6: '异域美景',
        7: '性感妖姬',
        9: '游戏主题',
        11: '美女壁纸',
    };

    const category = ctx.req.param('category');

    const currentUrl = `${rootUrl}/category-${category}/list-1/index.html?page=1`;

    ctx.set('data', await ProcessItems(ctx, categories[category], currentUrl));
};
