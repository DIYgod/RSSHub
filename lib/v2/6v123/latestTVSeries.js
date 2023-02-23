const { processItems } = require('./utils');

const baseURL = 'https://www.hao6v.tv/gvod/dsj.html';

module.exports = async (ctx) => {
    const item = await processItems(ctx, baseURL);

    ctx.state.data = {
        title: '6v电影-最新电影',
        link: baseURL,
        description: '6v最新电影RSS',
        item,
    };
};
