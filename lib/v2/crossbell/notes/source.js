const got = require('@/utils/got');
const { getItem } = require('./utils');

module.exports = async (ctx) => {
    const source = ctx.params.source;

    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            sources: source,
            includeCharacter: true,
        },
    });

    ctx.state.data = {
        title: 'Crossbell Notes from ' + source,
        link: 'https://crossbell.io/',
        item: response.data?.list?.map((item) => getItem(item)),
    };
};
