// @ts-nocheck
import got from '@/utils/got';
const { getItem } = require('./utils');

export default async (ctx) => {
    const characterId = ctx.req.param('characterId');

    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            characterId,
            includeCharacter: true,
        },
    });

    const name = response.data?.list?.[0]?.character?.metadata?.content?.name || response.data?.list?.[0]?.character?.handle || characterId;
    const handle = response.data?.list?.[0]?.character?.handle;

    ctx.set('data', {
        title: 'Crossbell Notes from ' + name,
        link: 'https://xchar.app/' + handle,
        item: response.data?.list?.map((item) => getItem(item)),
    });
};
