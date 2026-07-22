import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';
import { buildSubstackPostItem, getSubstackPostSlug, type SubstackPost } from '@/utils/substack';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/subscribe/:user',
    categories: ['blog'],
    view: ViewType.SocialMedia,
    example: '/substack/subscribe/norsemanmarkettiming',
    parameters: { user: 'Substack publication subdomain' },
    features: {
        requireConfig: [
            {
                name: 'SUBSTACK_COOKIE',
                optional: true,
                description: 'Complete Cookie header from a logged-in Substack session. Use only on a trusted self-hosted instance; protected posts are returned only when that account already has access.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Subscription',
    maintainers: ['pseudoyu'],
    handler,
    description: `Fetches each post from Substack's post API so the feed contains the body available to the requester. Set SUBSTACK\\_COOKIE on a trusted RSSHub instance to use an authenticated Substack session; paid posts are returned only when that account already has access.`,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    if (!isValidHost(user)) {
        throw new InvalidParameterError('Invalid user');
    }

    const baseUrl = `https://${user}.substack.com`;
    const cookie = config.substack.cookie;
    const headers = {
        Referer: baseUrl,
        'User-Agent': config.ua,
        ...(cookie && { Cookie: cookie }),
    };
    const response = await ofetch<string>(`${baseUrl}/feed`, { headers });
    const feed = await parser.parseString(response);

    const item = await pMap(
        feed.items,
        async (item) => {
            const slug = getSubstackPostSlug(item.link);
            if (!slug) {
                return buildSubstackPostItem(item, undefined, user);
            }

            try {
                const post = await cache.tryGet(`substack:post:v2:${user}:${slug}`, () => ofetch<SubstackPost>(`${baseUrl}/api/v1/posts/${encodeURIComponent(slug)}`, { headers }));
                return buildSubstackPostItem(item, post, user);
            } catch (error) {
                logger.warn(`[substack/subscribe] Failed to fetch post ${slug}: ${error instanceof Error ? error.message : String(error)}`);
                return buildSubstackPostItem(item, undefined, user);
            }
        },
        { concurrency: 5 }
    );

    return {
        title: feed.title ?? 'Substack',
        description: feed.description ?? `${user}'s Substack`,
        link: feed.link ?? baseUrl,
        image: feed.image?.url ?? '',
        item,
    };
}
