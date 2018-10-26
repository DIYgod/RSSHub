const { getList, getDetailWithCache } = require('./util');

const supportedKeys = ['parody', 'character', 'tag', 'artist', 'group', 'language', 'category'];

module.exports = async (ctx) => {
    const { keyword, key } = ctx.params;
    if (supportedKeys.indexOf(key) === -1) {
        ctx.state.data = {
            title: 'nHentai - unsupported',
        };
        return;
    }

    const list = await getList(`https://nhentai.net/${key}/${keyword.toLowerCase().replace(' ', '-')}`);
    const details = await Promise.all(list.map(getDetailWithCache.bind(null, ctx.cache)));

    ctx.state.data = {
        title: `nHentai - ${key} - ${keyword}`,
        link: 'https://nhentai.net',
        description: 'hentai',
        item: details,
    };
};
