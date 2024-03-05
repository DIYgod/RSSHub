// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');
import { config } from '@/config';

export default async (ctx) => {
    const site = ctx.req.param('site');
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new Error(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
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

    ctx.set('data', {
        title: `Featured Notes on ${site}`,
        link: `https://${site}/explore`,
        item: utils.parseNotes(list, site),
    });
};
