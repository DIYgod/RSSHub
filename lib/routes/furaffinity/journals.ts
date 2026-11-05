import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { getJournals } from './utils';

export const route: Route = {
    path: '/journals/:username',
    name: 'Journals',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/journals/fender',
    maintainers: ['TigerCubDen', 'SkyNetX007'],
    parameters: { username: 'Username, can find in userpage' },
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
            source: ['furaffinity.net/journals/:username'],
            target: '/journals/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();
    const data = await getJournals(username);

    const items = data.map((item) => ({
        title: item.title,
        link: item.link,
        guid: item.id,
        description: item.description,
        pubDate: item.posted_at ? parseDate(item.posted_at) : undefined,
        author: username,
    }));

    return {
        title: `Fur Affinity | ${username}'s Journals`,
        link: `https://www.furaffinity.net/journals/${username}`,
        description: `Fur Affinity ${username}'s Journals`,
        item: items,
    };
}
