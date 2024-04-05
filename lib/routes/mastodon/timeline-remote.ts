import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/remote/:site/:only_media?',
    categories: ['social-media'],
    example: '/mastodon/remote/pawoo.net/true',
    parameters: { site: 'instance address, only domain, no `http://` or `https://` protocol header', only_media: 'whether only display media content, default to false, any value to true' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Instance timeline (federated)',
    maintainers: ['hoilc'],
    handler,
    description: `If the instance address is not \`mastodon.social\` or \`pawoo.net\`, then the route requires \`ALLOW_USER_SUPPLY_UNSAFE_DOMAIN\` to be \`true\`.`,
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const only_media = ctx.req.param('only_media') ? 'true' : 'false';
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new Error(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const url = `http://${site}/api/v1/timelines/public?remote=true&only_media=${only_media}`;

    const response = await got.get(url, { headers: utils.apiHeaders() });
    const list = response.data;

    return {
        title: `Federated Public${ctx.req.param('only_media') ? ' Media' : ''} Timeline on ${site}`,
        link: `https://${site}`,
        item: utils.parseStatuses(list),
    };
}
