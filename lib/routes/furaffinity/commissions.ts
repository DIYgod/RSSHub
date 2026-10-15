import { load } from 'cheerio';

import type { Route } from '@/types';

import { getCommissions } from './utils';

export const route: Route = {
    path: '/commissions/:username',
    name: 'Commissions',
    url: 'furaffinity.net',
    categories: ['social-media'],
    example: '/furaffinity/commissions/fender',
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
            source: ['furaffinity.net/commissions/:username'],
            target: '/commissions/:username',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();
    const data = await getCommissions(username);
    const items = data.map((item) => {
        const $ = load(item.description, undefined, false);
        const typeName = $('h4').first().text() || item.title;
        $('h4').first().remove();
        return {
            title: typeName,
            link: item.submission.link,
            guid: `${item.submission.id ?? 'commission'}:${typeName}`,
            description: `${$.root().html() ?? ''}${item.submission.thumbnail ? `<br><img src="${item.submission.thumbnail}">` : ''}`,
            author: username,
        };
    });

    return {
        title: `Fur Affinity | ${username}'s Commissions`,
        link: `https://www.furaffinity.net/commissions/${username}`,
        description: `Fur Affinity ${username}'s Commissions`,
        item: items,
    };
}
