import { Route } from '@/types';
import { getConfig } from './utils';
import got from '@/utils/got';
import RSSParser from '@/utils/rss-parser';

export const route: Route = {
    path: '/:configId/:param1/:param2?/:param3?',
    categories: ['bbs'],
    example: '/discourse/0/latest',
    parameters: { configId: 'Environment variable configuration id, see above', id: 'Category id' },
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
    name: 'Official rss',
    maintainers: ['Raikyou'],
    handler,
};

async function handler(ctx) {
    const { link, key } = getConfig(ctx);
    const { param1, param2, param3 } = ctx.req.param();

    const url = `${link}/${param1}${param2 ? `/${param2}` : ''}${param3 ? `/${param3}` : ''}.rss`;

    const feed = await RSSParser.parseString(
        (
            await got(url, {
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
