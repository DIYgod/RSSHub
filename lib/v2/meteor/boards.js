const { baseUrl, getBoards } = require('./utils');

module.exports = async (ctx) => {
    const items = await getBoards(ctx.cache.tryGet);

    ctx.set('data', {
        title: '看板列表',
        link: `${baseUrl}/board/all`,
        item: items,
    });
};
