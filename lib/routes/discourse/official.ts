import { Route } from '@/types';
import { getConfig } from './utils';
import got from '@/utils/got';
import RSSParser from '@/utils/rss-parser';

export const route: Route = {
    path: '/:configId/official/:path{.+}',
    categories: ['bbs'],
    example: '/discourse/0/official/latest',
    parameters: {
        configId: 'Environment variable configuration id, see above',
        path: 'Discourse RSS path between `domain` and `.rss`. All supported Rss path can be found in [https://meta.discourse.org/t/finding-discourse-rss-feeds/264134](https://meta.discourse.org/t/finding-discourse-rss-feeds/264134). For example: the path of [https://meta.discourse.org/top/all.rss](https://meta.discourse.org/top/all.rss) is `top/all`.',
    },
    features: {
        requireConfig: [
            {
                name: 'DISCOURSE_CONFIG_*',
                description: `Configure the Discourse environment variables referring to [https://docs.rsshub.app/deploy/config#discourse](https://docs.rsshub.app/deploy/config#discourse).`,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Official RSS',
    maintainers: ['Raikyou', 'dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const { link, key } = getConfig(ctx);
    const path = ctx.req.param('path');

    const url = `${link}/${path}.rss`;

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
