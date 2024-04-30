import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/notes/character/:characterId',
    categories: ['social-media'],
    example: '/crossbell/notes/character/10',
    parameters: { characterId: 'N' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['crossbell.io/*'],
            target: '/notes',
        },
    ],
    name: 'Notes of character',
    maintainers: ['DIYgod', 'markbang'],
    handler,
    url: 'crossbell.io/*',
};

async function handler(ctx) {
    const characterId = ctx.req.param('characterId');

    const response = await got(`https://indexer.crossbell.io/v1/characters/${characterId}/notes`);
    const response_getCharacter = await got(`https://indexer.crossbell.io/v1/characters/${characterId}`);

    const name = response_getCharacter.data?.metadata?.content?.name || characterId;
    const handle = response_getCharacter.data?.handle || '*';

    return {
        title: 'Crossbell Notes from ' + name,
        link: 'https://xchar.app/' + handle,
        item: response.data?.list?.map((item) => {
            let link = item.noteId ? `https://crossbell.io/notes/${item.characterId}-${item.noteId}` : 'https://xchar.app/' + handle;
            if (link.startsWith('https://xn--')) {
                link = `https://crossbell.io/notes/${item.characterId}-${item.noteId}`;
            }

            return {
                title: item.metadata?.content?.title || 'Untitled Note',
                description: `${item.metadata?.content?.content} <br>Character: ${name}@${handle}`,
                link,
                pubDate: item.createdAt,
                updated: item.updatedAt,
                author: name || handle,
                guid: item.transactionHash + item.logIndex + item.linkItemType,
                category: [...(item.metadata?.content?.sources || []), ...(item.metadata?.content?.tags || [])],
            };
        }),
    };
}
