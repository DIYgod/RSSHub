// @ts-nocheck
import got from '@/utils/got';
const url = require('url');
import { load } from 'cheerio';

export default async (ctx) => {
    const country = ctx.req.param('country');
    const id = ctx.req.param('id');
    const link = `https://apps.apple.com/${country}/app/${id}`;
    const target = url.resolve(link, '?mt=8#see-all/in-app-purchases');

    const res = await got.get(target);
    const $ = load(res.data);
    const lang = $('html').attr('lang');

    const apiResponse = (
        await got({
            method: 'get',
            url: `https://amp-api.apps.apple.com/v1/catalog/${country}/apps/${id.replace('id', '')}?platform=web&include=Cmerchandised-in-apps%2Ctop-in-apps%2Ceula&l=${lang}`,
            headers: {
                authorization:
                    'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNSRjVITkJHUFEifQ.eyJpc3MiOiI4Q1UyNk1LTFM0IiwiaWF0IjoxNjA3MDMxMTcwLCJleHAiOjE2MTAwNTUxNzB9.qzq2PKkPBNDwHbShoBY3T7J2IjgWsR_MyAvTnZtQB5FZjsH_ZY5esBa0qXbA9kUiq_90GkRoNVMR03meOQQ7SQ',
                authority: 'amp-api.apps.apple.com',
                referer: target,
            },
        })
    ).data.data[0];

    const attributes = apiResponse.attributes;
    const titleTemp = attributes.name;

    const platform = attributes.deviceFamilies.includes('mac') ? 'macOS' : 'iOS';
    let title;
    let item = [];

    const iap = apiResponse.relationships['top-in-apps'].data;
    if (iap) {
        title = `${country === 'cn' ? '内购限免提醒' : 'IAP price watcher'}: ${titleTemp} for ${platform}`;

        item = iap.map((e) => {
            const title = `${e.attributes.name} is now ${e.attributes.offers[0].priceFormatted}`;

            const result = {
                link,
                guid: e.attributes.url,
                description: e.attributes.artwork ? e.attributes.description.standard + `<br><img src=${e.attributes.artwork.url.replace('{w}x{h}{c}.{f}', '320x0w.jpg')}>` : e.attributes.description.standard,
                title,
                pubDate: new Date().toUTCString(),
            };
            return result;
        });
    }

    ctx.set('data', {
        title,
        link,
        item,
    });
};
