const { getSimple, getDetails } = require('./util');

module.exports = async (ctx) => {
    const { keyword, mode } = ctx.params;
    const isSimple = mode !== 'detail';

    const simples = await getSimple(`https://nhentai.net/search/?q=${keyword}`);

    ctx.state.data = {
        title: `nHentai - search - ${keyword}`,
        link: 'https://nhentai.net',
        description: 'hentai',
        item: isSimple ? simples : await getDetails(ctx.cache, simples),
    };
};
