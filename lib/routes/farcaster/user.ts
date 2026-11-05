import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/user/:username',
    categories: ['social-media'],
    example: '/farcaster/user/vitalik.eth',
    parameters: { username: 'Farcaster username' },
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
            source: ['warpcast.com/:username'],
            target: '/user/:username',
        },
    ],
    name: 'Farcaster User',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    const limit = Math.min(getRouteLimit(ctx, 50), 50);

    const user = (
        await got('https://client.warpcast.com/v2/user-by-username', {
            searchParams: { username },
        })
    ).data.result.user;

    const casts = (
        await got('https://client.warpcast.com/v2/casts', {
            searchParams: { fid: user.fid, limit },
        })
    ).data.result.casts;

    return {
        title: `${user.displayName} on Farcaster`,
        link: `https://warpcast.com/${username}`,
        item: casts.map((item) => ({
            title: item.text,
            description: `${item.parentAuthor ? `Replying to @${item.parentAuthor.username}: ` : ''}${item.text} ${item.embeds?.urls?.map((url) => `<a href="${url.openGraph.url}">${url.openGraph.title}</a>`).join(' ') || ''} ${item.embeds?.images?.map((image) => `<img src="${image.url}" />`).join(' ') || ''}`,
            link: `https://farcaster.xyz/${user.username}/${item.hash.slice(0, 10)}`,
            pubDate: parseDate(item.timestamp),
            guid: item.hash,
        })),
    };
}
