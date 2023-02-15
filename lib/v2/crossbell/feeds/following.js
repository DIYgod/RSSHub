const got = require('@/utils/got');

module.exports = async (ctx) => {
    const characterId = ctx.params.characterId;
    const response = await got(`https://indexer.crossbell.io/v1/characters/${characterId}/feed/follow`);
    ctx.state.data = {
        title: 'Crossbell Feeds of ' + characterId,
        link: 'https://crossbell.io/',
        item: response.data?.list?.map((item) => ({
            title: `${item.type} ${item.character.metadata?.content?.name}@${item.character.handle}`,
            description: `${item.type} ${item.note && `<br>Note: ${item.note.metadata?.content?.title || item.note.metadata?.content?.content}`}${
                item.character && `<br>Character: ${item.character.metadata?.content?.name}@${item.character.handle}`
            }`,
            link: item.note ? item.note?.metadata?.content?.external_urls || `https://crossbell.io/notes/${item.note?.characterId}-${item.note?.noteId}` : 'https://xchar.app/' + item.character?.handle,
            pubDate: item.createdAt,
            updated: item.updatedAt,
            author: item.note?.metadata?.content?.authors?.[0] || item.note?.character?.metadata?.content?.name || item.note?.character?.handle || item.owner,
            guid: item.transactionHash + item.logIndex + item.type,
            category: [...(item.note?.metadata?.content?.sources || []), ...(item.note?.metadata?.content?.tags || [])],
        })),
    };
};
