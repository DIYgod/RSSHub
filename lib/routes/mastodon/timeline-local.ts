// @ts-nocheck
import got from '@/utils/got';
const utils = require('./utils');
import { config } from '@/config';

export default async (ctx) => {
    const site = ctx.req.param('site');
    const only_media = ctx.req.param('only_media') ? 'true' : 'false';
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new Error(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const url = `http://${site}/api/v1/timelines/public?local=true&only_media=${only_media}`;

    const response = await got.get(url, { headers: utils.apiHeaders() });
    const list = response.data;

    ctx.set('data', {
        title: `Local Public${ctx.req.param('only_media') ? ' Media' : ''} Timeline on ${site}`,
        link: `https://${site}`,
        item: utils.parseStatuses(list),
    });
};
