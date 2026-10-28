import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { getComments } from './utils';

export const route: Route = {
    path: '/journal-comments/:id',
    name: 'Journal Comments',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/journal-comments/10925112',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: { id: 'Journal ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['furaffinity.net/journal/:id'],
            target: '/journal-comments/:id',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { id } = ctx.req.param();
    const { comments: dataComments, ...dataJournal } = await getComments('journal', id);

    const items = dataComments.map((item) => ({
        title: item.text,
        link: `https://www.furaffinity.net/journal/${id}/#cid:${item.id}`,
        guid: item.id,
        description: item.text,
        pubDate: item.posted_at ? parseDate(item.posted_at) : undefined,
        author: [{ name: item.name, ...(item.avatar && { avatar: new URL(item.avatar, 'https://www.furaffinity.net').href }) }],
    }));

    return {
        title: `${dataJournal.title} - ${dataJournal.name} | Journal Comments`,
        link: `https://www.furaffinity.net/journal/${id}`,
        description: `Fur Affinity | ${dataJournal.title} by ${dataJournal.name} - Journal Comments`,
        item: items,
    };
}
