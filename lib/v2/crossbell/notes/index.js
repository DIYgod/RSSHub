const got = require('@/utils/got');
const { getItem } = require('./utils');

module.exports = async (ctx) => {
    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            includeCharacter: true,
        },
    });

    ctx.state.data = {
        title: 'Crossbell Notes',
        link: 'https://crossbell.io/',
        item: response.data?.list?.map((item) => getItem(item)),
    };
};
