import { Route } from '@/types';
import utils from './utils';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/account_id/:site/:account_id/statuses/:only_media?',
    name: 'Unknown',
    maintainers: ['notofoe'],
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const account_id = ctx.req.param('account_id');
    const only_media = ctx.req.param('only_media') ? 'true' : 'false';
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
