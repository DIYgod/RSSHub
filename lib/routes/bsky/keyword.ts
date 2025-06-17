import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/keyword/:keyword',
    categories: ['social-media'],
    example: '/bsky/keyword/hello',
    parameters: { keyword: 'N' },
    features: {
        requireConfig: [
            {
                name: 'BSKY_AUTHORIZATION',
                description: 'The authorization token for the Bluesky API',
                optional: false,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Keywords',
    maintainers: ['untitaker', 'DIYgod'],
    handler,
};

async function handler(ctx) {
    if (!config.bsky.authorization) {
        throw new ConfigNotFoundError('BSKY_AUTHORIZATION is not set');
    }

    const keyword = ctx.req.param('keyword');

    const data = await ofetch(`https://stinkhorn.us-west.host.bsky.network/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(keyword)}&limit=25&sort=latest`, {
        headers: {
            Authorization: `Bearer ${config.bsky.authorization}`,
        },
    });

    const items = data.posts.map((post) => ({
        title: post.record.text,
        link: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`,
        description: post.record.text,
        pubDate: new Date(post.record.createdAt),
        author: [
            {
                name: post.author.displayName,
                url: `https://bsky.app/profile/${post.author.handle}`,
                avatar: post.author.avatar,
            },
        ],
    }));

    return {
        title: `Bluesky Keyword - ${keyword}`,
        link: `https://bsky.app/search?q=${encodeURIComponent(keyword)}`,
        item: items,
    };
}
