import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/timeline/:account',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/fediverse/timeline/Mastodon@mastodon.social',
    parameters: { account: 'username@domain' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Timeline',
    maintainers: ['DIYgod', 'pseudoyu'],
    handler,
};

const allowedDomain = new Set(['mastodon.social', 'pawoo.net', config.mastodon.apiHost].filter(Boolean));
const activityPubTypes = new Set(['application/activity+json', 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"']);

async function handler(ctx) {
    const account = ctx.req.param('account');
    const domain = account.split('@')[1];
    const username = account.split('@')[0];

    if (!domain || !username) {
        throw new InvalidParameterError('Invalid account');
    }
    if (!config.feature.allow_user_supply_unsafe_domain && !allowedDomain.has(domain.toLowerCase())) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const requestOptions = {
        headers: {
            Accept: 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
        },
    };

    const acc = await ofetch(`https://${domain}/.well-known/webfinger?resource=acct:${account}`, {
        headers: {
            Accept: 'application/jrd+json',
        },
    });
    const jsonLink = acc.links.find((link) => link.rel === 'self' && activityPubTypes.has(link.type))?.href;
    const link = acc.links.find((link) => link.rel === 'http://webfinger.net/rel/profile-page')?.href;
    const officialFeed = await parser.parseURL(`${link}.rss`);

    if (officialFeed) {
        return {
            title: `${officialFeed.title} (Fediverse@${account})`,
            description: officialFeed.description,
            image: officialFeed.image?.url,
            link: officialFeed.link,
            item: officialFeed.items.map((item) => ({
                title: item.title,
                description: item.content,
                link: item.link,
                pubDate: item.pubDate ? parseDate(item.pubDate) : null,
                guid: item.guid,
            })),
        };
    }

    const self = await ofetch(jsonLink, requestOptions);

    // If RSS feed is not available, fallback to original method
    const outbox = await ofetch(self.outbox, requestOptions);
    const firstOutbox = await ofetch(outbox.first, requestOptions);

    const items = firstOutbox.orderedItems;

    const itemResolvers = [] as Promise<any>[];

    for (const item of items) {
        if (!['Announce', 'Create', 'Update'].includes(item.type)) {
            continue;
        }
        if (typeof item.object === 'string') {
            itemResolvers.push(
                (async (item) => {
                    item.object = await ofetch(item.object, requestOptions);
                    return item;
                })(item)
            );
        } else {
            itemResolvers.push(Promise.resolve(item));
        }
    }

    const resolvedItems = await Promise.all(itemResolvers);

    return {
        title: `${self.name || self.preferredUsername} (Fediverse@${account})`,
        description: self.summary,
        image: self.icon?.url || self.image?.url,
        link,
        item: resolvedItems.map((item) => ({
            title: item.object.content.replaceAll(/<[^<]*>/g, ''),
            description: `${item.object.content}\n${item.object.attachment?.map((attachment) => `<img src="${attachment.url}" width="${attachment.width}" height="${attachment.height}" />`).join('\n') || ''}`,
            link: item.object.url,
            pubDate: parseDate(item.published),
            guid: item.id,
        })),
    };
}
