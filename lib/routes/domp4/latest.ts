// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

const { defaultDomain, ensureDomain } = require('./utils');

function getItemList($, type) {
    const list = $(`#${type} .list-group-item`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `https://${defaultDomain}${item.find('a').attr('href')}`, // fixed domain for guid
            };
        });
    return list;
}

export default async (ctx) => {
    const { type = 'vod' } = ctx.req.param();
    const { domain } = ctx.req.query();

    const hostUrl = ensureDomain(ctx, domain);
    const latestUrl = `${hostUrl}/custom/update.html`;

    const res = await got.get(latestUrl);
    const $ = load(res.data);
    const list = getItemList($, type);

    ctx.set('data', {
        link: latestUrl,
        title: 'domp4电影',
        item: list,
    });
};
