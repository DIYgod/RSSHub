const { getSimple, getDetails, getTorrents } = require('./util');

const supportedKeys = ['parody', 'character', 'tag', 'artist', 'group', 'language', 'category'];

module.exports = async (ctx) => {
    const { keyword, key, mode } = ctx.params;

    if (supportedKeys.indexOf(key) === -1) {
        ctx.state.data = {
            title: 'nHentai - unsupported',
        };
        return;
    }

    const url = `https://nhentai.net/${key}/${keyword.toLowerCase().replace(' ', '-')}/`;

    const simples = await getSimple(url);

    ctx.state.data = {
        title: `nHentai - ${key} - ${keyword}`,
        link: url,
        description: 'hentai',
        item: mode === 'detail' ? await getDetails(ctx.cache, simples) : mode === 'torrent' ? await getTorrents(ctx.cache, simples) : simples,
    };
};
