import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

import utils from './utils';

export const route: Route = {
    path: '/tag/:site/:hashtag/:only_media?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/mastodon/tag/mastodon.social/gochisou/true',
    parameters: {
        site: 'instance address, only domain, no `http://` or `https://` protocol header',
        hashtag: 'Hashtag you want to subscribe to (without the # symbol)',
        only_media: {
            description: 'whether only display media content, default to false, any value to true',
            options: [
                { value: 'true', label: 'true' },
                { value: 'false', label: 'false' },
            ],
            default: 'false',
        },
    },
    name: 'Hashtag timeline',
    maintainers: ['yuikisaito'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { site, hashtag } = ctx.req.param();
    const only_media = ctx.req.param('only_media') === 'true' ? 'true' : 'false';
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const url = `http://${site}/api/v1/timelines/tag/${hashtag}?only_media=${only_media}`;

    const response = await got.get(url, { headers: utils.apiHeaders(site) });
    const list = response.data;

    return {
        title: `#${hashtag} ${only_media === 'true' ? ' Media' : ''} Timeline on ${site}`,
        link: `https://${site}`,
        item: utils.parseStatuses(list),
    };
}
