import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import utils from './utils';

export const route: Route = {
    path: '/trends/:site/:type?',
    categories: ['social-media'],
    example: '/mastodon/trends/mastodon.social',
    parameters: {
        site: 'Instance domain, without a protocol.',
        type: {
            description: 'Trending content type.',
            default: 'statuses',
            options: [
                { value: 'statuses', label: 'Posts' },
                { value: 'tags', label: 'Hashtags' },
                { value: 'links', label: 'Links' },
            ],
        },
    },
    name: 'Trending posts, hashtags and links',
    maintainers: ['DIYgod'],
    description: 'Instances outside the existing Mastodon domain allowlist require `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN=true` or `MASTODON_API_HOST`. Availability depends on the instance enabling public trends.',
    radar: [
        { source: ['mastodon.social/explore'], target: '/trends/mastodon.social/statuses' },
        { source: ['mastodon.social/explore/tags'], target: '/trends/mastodon.social/tags' },
        { source: ['mastodon.social/explore/links'], target: '/trends/mastodon.social/links' },
    ],
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const type = ctx.req.param('type') ?? 'statuses';
    if (!['statuses', 'tags', 'links'].includes(type)) {
        throw new InvalidParameterError('The trend type must be statuses, tags or links.');
    }
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new ConfigNotFoundError('RSS for this domain requires ALLOW_USER_SUPPLY_UNSAFE_DOMAIN=true or MASTODON_API_HOST.');
    }

    const { Authorization: authorization } = utils.apiHeaders(site);
    const data = await ofetch(`https://${site}/api/v1/trends/${type}`, { headers: authorization ? { Authorization: authorization } : undefined });
    const items =
        type === 'statuses'
            ? utils.parseStatuses(data)
            : data.map((item) => ({
                  title: type === 'tags' ? `#${item.name}` : item.title,
                  link: item.url,
                  description: renderToString(
                      <>
                          {item.image && <img src={item.image} alt={item.image_description ?? ''} />}
                          {item.description && <p>{item.description}</p>}
                          {type === 'tags' && item.history?.[0] && (
                              <p>
                                  {item.history[0].uses} posts by {item.history[0].accounts} accounts
                              </p>
                          )}
                      </>
                  ),
                  author: item.author_name || undefined,
                  pubDate: item.published_at ? parseDate(item.published_at) : undefined,
              }));

    return {
        title: `Trending ${type} on ${site}`,
        link: `https://${site}/explore${type === 'statuses' ? '' : `/${type}`}`,
        item: items,
    };
}
