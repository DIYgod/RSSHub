const got = require('@/utils/got');
const { getItem } = require('./utils');

module.exports = async (ctx) => {
    const characterId = ctx.params.characterId;

    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            characterId,
            includeCharacter: true,
        },
    });

    const name = response.data?.list?.[0]?.character?.metadata?.content?.name || response.data?.list?.[0]?.character?.handle || characterId;
    const handle = response.data?.list?.[0]?.character?.handle;

    ctx.state.data = {
        title: 'Crossbell Notes from ' + name,
        link: 'https://xchar.app/' + handle,
        item: response.data?.list?.map((item) => getItem(item)),
    };
};
