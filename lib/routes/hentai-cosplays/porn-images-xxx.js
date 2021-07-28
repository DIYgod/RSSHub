const { processFeed } = require('./utils');

module.exports = async (ctx) => {
    const url = ctx.params.type ? `https://ja.porn-images-xxx.com/search/${ctx.params.type}/${encodeURIComponent(ctx.params.name)}/` : 'https://ja.porn-images-xxx.com/search/';
    const items = await processFeed(ctx, url);
    ctx.state.data = {
        title: `${ctx.params.name || '新着画像一覧'} - エロ画像`,
        link: url,
        item: items,
    };
};
