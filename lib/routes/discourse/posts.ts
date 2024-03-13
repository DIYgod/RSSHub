import { Route } from '@/types';
import { getConfig } from './utils';
import got from '@/utils/got';
import RSSParser from '@/utils/rss-parser';

export const route: Route = {
    path: '/:configId/posts',
    categories: ['bbs'],
    example: '/discourse/0/posts',
    parameters: { configId: 'Environment variable configuration id, see above' },
    features: {
        requireConfig: [
            {
                name: 'DISCOURSE_CONFIG_*',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Latest posts',
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const { link, key } = getConfig(ctx);

    const feed = await RSSParser.parseString(
        (
            await got(`${link}/posts.rss`, {
                headers: {
                    'User-Api-Key': key,
                },
            })
        ).data
    );

    feed.items = feed.items.map((e) => ({
        description: e.content,
        author: e.creator,
        ...e,
    }));

    return { item: feed.items, ...feed };
}
