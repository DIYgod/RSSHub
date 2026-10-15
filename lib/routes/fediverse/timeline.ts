import { html } from 'hono/html';
import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
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

function renderAttachment(attachment) {
    if (attachment.mediaType?.startsWith('video/')) {
        return html`<video controls src="${attachment.url}"></video>`;
    }
    const width = attachment.width ? html` width="${attachment.width}"` : '';
    const height = attachment.height ? html` height="${attachment.height}"` : '';
    return html`<img src="${attachment.url}" ${width}${height} />`;
}

async function handler(ctx) {
    const account = ctx.req.param('account');
    const domain = account.split('@', 2)[1];
    const username = account.split('@', 1)[0];

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
    let officialFeed;
    try {
        officialFeed = await parser.parseURL(`${link}.rss`);
    } catch (error) {
        logger.debug(`The official RSS feed is unavailable; trying the public ActivityPub outbox: ${error}`);
    }

    if (officialFeed) {
        return {
            title: `${officialFeed.title} (Fediverse@${account})`,
            description: officialFeed.description,
            image: officialFeed.image?.url,
            link: officialFeed.link,
            item: officialFeed.items.map((item) => ({
                title: item.title!,
                description: item.content,
                link: item.link,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                guid: item.guid,
            })),
        };
    }

    const self = await ofetch(jsonLink, requestOptions);

    // If RSS feed is not available, fallback to original method
    const outbox = await ofetch(self.outbox, requestOptions);
    const firstOutbox = await ofetch(outbox.first, requestOptions);

    const items = firstOutbox.orderedItems.filter((item) => ['Announce', 'Create', 'Update'].includes(item.type)).map((item) => ({ ...item, pubDate: item.published ? parseDate(item.published) : undefined }));
    const candidates = items;
    const resolvedItems = await pMap(candidates, async (item: any) => ({ ...item, object: item.object.type ? item.object : await cache.tryGet(item.object, () => ofetch(item.object, requestOptions)) }), { concurrency: 3 });

    return {
        title: `${self.name || self.preferredUsername} (Fediverse@${account})`,
        description: self.summary,
        image: self.icon?.url || self.image?.url,
        link,
        item: resolvedItems.map((item) => ({
            title: item.object.content.replaceAll(/<[^<]*>/g, ''),
            description: `${item.object.content}\n${item.object.attachment?.map(renderAttachment).join('\n') || ''}`,
            link: item.object.url || item.object.id,
            pubDate: item.pubDate,
            guid: item.id,
        })),
    };
}
