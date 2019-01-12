const { getSimple, getDetails } = require('./util');

const supportedKeys = ['parody', 'character', 'tag', 'artist', 'group', 'language', 'category'];

module.exports = async (ctx) => {
    const { keyword, key, mode } = ctx.params;
    const isSimple = mode !== 'detail';

    if (supportedKeys.indexOf(key) === -1) {
        ctx.state.data = {
            title: 'nHentai - unsupported',
        };
        return;
    }

    const simples = await getSimple(`https://nhentai.net/${key}/${keyword.toLowerCase().replace(' ', '-')}`);

    ctx.state.data = {
        title: `nHentai - ${key} - ${keyword}`,
        link: 'https://nhentai.net',
        description: 'hentai',
        item: isSimple ? simples : await getDetails(ctx.cache, simples),
    };
};
