import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import utils from './utils';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/notes/featured/:site',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/misskey/notes/featured/misskey.io',
    parameters: { site: 'instance address, domain only, without `http://` or `https://` protocol header' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Featured Notes',
    maintainers: ['Misaka13514'],
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    // docs on: https://misskey-hub.net/docs/api/endpoints/notes/featured.html
    const url = `https://${site}/api/notes/featured`;
    const response = await got({
        method: 'post',
        url,
        json: {
            limit: 10,
            offset: 0,
        },
    });

    const list = response.data;

    return {
        title: `Featured Notes on ${site}`,
        link: `https://${site}/explore`,
        item: utils.parseNotes(list, site),
    };
}
