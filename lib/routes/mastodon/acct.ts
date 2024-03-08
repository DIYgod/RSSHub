import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/acct/:acct/statuses/:only_media?',
    categories: ['new-media'],
    example: '/mastodon/acct/CatWhitney@mastodon.social/statuses',
    parameters: { acct: 'Webfinger account URI, like `user@host`', only_media: 'whether only display media content, default to false, any value to true' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User timeline',
    maintainers: ['notofoe'],
    handler,
};

async function handler(ctx) {
    const acct = ctx.req.param('acct');
    const only_media = ctx.req.param('only_media') ? 'true' : 'false';

    const { site, account_id } = await utils.getAccountIdByAcct(acct);

    const { account_data, data } = await utils.getAccountStatuses(site, account_id, only_media);

    return {
        title: `${account_data.display_name} (@${account_data.acct})`,
        link: account_data.url,
        description: account_data.note,
        item: utils.parseStatuses(data),
        allowEmpty: true,
    };
}
