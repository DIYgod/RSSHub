import { Route, ViewType } from '@/types';
import utils from './utils';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/account_id/:site/:account_id/statuses/:only_media?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/mastodon/account_id/mas.to/109300507275095341/statuses/false',
    parameters: {
        site: 'instance address, only domain, no `http://` or `https://` protocol header',
        account_id: 'account ID, you can get it from `https://INSTANCE/api/v1/accounts/lookup?acct=USERNAME` api',
        only_media: {
            description: 'whether only display media content, default to false, any value to true',
            options: [
                { value: 'true', label: 'true' },
                { value: 'false', label: 'false' },
            ],
            default: 'false',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User timeline (by account ID)',
    maintainers: ['notofoe', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const account_id = ctx.req.param('account_id');
    const only_media = ctx.req.param('only_media') === 'true' ? 'true' : 'false';
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const { account_data, data } = await utils.getAccountStatuses(site, account_id, only_media);

    return {
        title: `${account_data.display_name} (@${account_data.acct})`,
        link: account_data.url,
        description: account_data.note,
        item: utils.parseStatuses(data),
        allowEmpty: true,
    };
}
