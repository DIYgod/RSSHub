const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const titles = {
        mt: '月票榜',
        rise: '飙升榜',
        new: '新作榜',
        pay: '畅销榜',
        top: 'TOP100',
        male: '男生榜',
        female: '女生榜',
    };

    const type = ctx.params.type ?? 'mt';
    const time = ctx.params.time ?? 'cur';

    const currentUrl = `${rootUrl}/Rank/comicRank/type/${type}`;

    ctx.state.data = await ProcessItems(ctx, currentUrl, time, titles[type]);
};
