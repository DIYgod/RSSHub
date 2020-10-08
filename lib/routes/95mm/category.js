const utils = require('./utils');

module.exports = async (ctx) => {
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

    const rootUrl = `https://www.95mm.net/category-${ctx.params.category}/list-1/index.html?page=1`;

    ctx.state.data = await utils(ctx, categories[ctx.params.category], rootUrl);
};
