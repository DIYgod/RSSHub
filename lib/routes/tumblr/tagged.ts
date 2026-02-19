import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { fallback, queryToInteger } from '@/utils/readable-social';

import utils from './utils';

export const route: Route = {
    path: '/tagged/:tag',
    categories: ['social-media'],
    example: '/tumblr/tagged/nature',
    parameters: {
        tag: 'Tag name (see `https://www.tumblr.com/docs/en/api/v2#tagged--get-posts-with-tag`)',
    },
    radar: [],
    features: {
        requireConfig: [
            {
                name: 'TUMBLR_CLIENT_ID',
                description: 'Please see above for details.',
            },
            {
                name: 'TUMBLR_CLIENT_SECRET',
                description: 'Please see above for details.',
            },
            {
                name: 'TUMBLR_REFRESH_TOKEN',
                description: 'Please see above for details.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Tagged Posts',
    maintainers: ['PolarisStarnor'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    if (!config.tumblr || !config.tumblr.clientId) {
        throw new ConfigNotFoundError('Tumblr RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const tag = ctx.req.param('tag');
    const limit = fallback(undefined, queryToInteger(ctx.req.query('limit')), 20);

    const response = await got.get('https://api.tumblr.com/v2/tagged', {
        searchParams: {
            tag,
            api_key: utils.generateAuthParams(),
            limit,
        },
        headers: await utils.generateAuthHeaders(),
    });

    const posts = response.data.response.map((post: any) => utils.processPost(post));

    return {
        title: `Tumblr - ${tag}`,
        description: `Tumblr posts tagged #${tag}`,
        link: `https://tumblr.com/tagged/${tag}`,
        item: posts,
        allowEmpty: true,
    };
}
