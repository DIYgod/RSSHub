import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/:url{.+}',
    categories: ['other'],
    example: '/rss/https%3A%2F%2Fwww.nasa.gov%2Ffeed%2F',
    name: 'Feed proxy',
    maintainers: ['DIYgod'],
    parameters: { url: 'Upstream RSS or Atom URL, encoded with encodeURIComponent.' },
    features: { requireConfig: [{ name: 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN', description: 'Must be true to allow fetching user-supplied feed URLs.' }] },
    description: 'Fetch an existing RSS or Atom feed through your instance. TLS certificates are verified. Common parameters and output formats work as usual.',
    handler,
};

async function handler(ctx) {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        throw new ConfigNotFoundError('Set ALLOW_USER_SUPPLY_UNSAFE_DOMAIN=true to enable user-supplied feed URLs.');
    }
    let url: URL;
    try {
        url = new URL(ctx.req.param('url'));
    } catch {
        throw new InvalidParameterError('Provide an encoded absolute HTTP or HTTPS feed URL.');
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new InvalidParameterError('Feed URLs must use HTTP or HTTPS and must not contain credentials.');
    }
    const response = await ofetch(url.href, { responseType: 'text' });
    const feed = await parser.parseString(response);
    return {
        title: feed.title || url.hostname,
        link: feed.link || url.origin,
        description: feed.description,
        image: feed.image?.url,
        language: feed.language,
        item: feed.items.map((item) => ({
            title: item.title || item.link || item.guid || 'Untitled',
            link: item.link,
            guid: item.guid || item.id || item.link,
            description: item['content:encoded'] || item.content || item.description || item.summary,
            author: item.creator || item.author,
            category: item.categories,
            pubDate: item.isoDate || item.pubDate ? parseDate((item.isoDate || item.pubDate)!) : undefined,
            ...(item.enclosure && {
                enclosure_url: item.enclosure.url,
                enclosure_type: item.enclosure.type,
                enclosure_length: item.enclosure.length || undefined,
            }),
        })),
    };
}
