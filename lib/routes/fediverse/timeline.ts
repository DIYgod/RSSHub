import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Route, ViewType } from '@/types';

import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/timeline/:account',
    categories: ['social-media', 'popular'],
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
    maintainers: ['DIYgod'],
    handler,
};

const allowedDomain = new Set(['mastodon.social', 'pawoo.net', config.mastodon.apiHost].filter(Boolean));

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
            Accept: 'application/activity+json',
        },
    };

    const acc = await ofetch(`https://${domain}/.well-known/webfinger?resource=acct:${account}`, requestOptions);

    const jsonLink = acc.links.find((link) => link.rel === 'self')?.href;
    const link = acc.links.find((link) => link.rel === 'http://webfinger.net/rel/profile-page')?.href;

    const self = await ofetch(jsonLink, requestOptions);

    const outbox = await ofetch(self.outbox, requestOptions);
    const firstOutbox = await ofetch(outbox.first, requestOptions);

    const items = firstOutbox.orderedItems;

    return {
        title: `${self.name || self.preferredUsername} (Fediverse@${account})`,
        description: self.summary,
        image: self.icon?.url || self.image?.url,
        link,
        item: items.map((item) => {
            const object =
                typeof item.object === 'string'
                    ? {
                          content: item.object,
                      }
                    : item.object;
            return {
                title: object.content,
                description: `${object.content}\n${object.attachment?.map((attachment) => `<img src="${attachment.url}" width="${attachment.width}" height="${attachment.height}" />`).join('\n') || ''}`,
                link: item.url,
                pubDate: parseDate(item.published),
                guid: item.id,
            };
        }),
    };
}
