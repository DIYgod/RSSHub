import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import got from '@/utils/got';
import RSSParser from '@/utils/rss-parser';

import { getConfig } from './utils';

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
                description: 'Configure the Discourse environment variables referring to [https://docs.rsshub.app/deploy/config#discourse](https://docs.rsshub.app/deploy/config#discourse).',
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
    const discourseConfig: unknown = getConfig(ctx);
    const { link, key } = discourseConfig as { link: string; key: string };
    const segments = ctx.req.param('path').split('/');
    if (segments.some((segment) => ['', '.', '..'].includes(segment))) {
        throw new InvalidParameterError('Invalid path');
    }

    const url = `${link}/${segments.map((segment) => encodeURIComponent(segment)).join('/')}.rss`;

    const feed = await RSSParser.parseString(
        (
            await got(url, {
                headers: key ? { 'User-Api-Key': key } : {},
                credentialHeaders: ['User-Api-Key'],
            })
        ).data
    );

    feed.items = feed.items.map((e) => ({
        description: e.content,
        author: e.creator,
        ...e,
    }));

    return { item: feed.items, ...feed } as Data;
}
