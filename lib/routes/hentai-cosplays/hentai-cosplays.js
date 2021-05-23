const { processFeed } = require('./utils');

module.exports = async (ctx) => {
    const url = ctx.params.type ? `https://ja.hentai-cosplays.com/search/${ctx.params.type}/${encodeURIComponent(ctx.params.name)}/` : 'https://ja.hentai-cosplays.com/search/';
    const items = await processFeed(url);
    ctx.state.data = {
        title: `${ctx.params.name || '新着コスプレ一覧'} - エロコスプレ`,
        link: url,
        item: items,
    };
};
