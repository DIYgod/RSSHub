// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

function jsonGet(obj, attr) {
    if (typeof attr !== 'string') {
        return obj;
    }
    // a.b.c
    // a.b[0].c => a.b.0.c
    for (const key of attr.split('.')) {
        obj = obj[key];
    }
    return obj;
}

export default async (ctx) => {
    if (!config.feature.allow_user_supply_unsafe_domain) {
        throw new Error(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const url = ctx.req.param('url');
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    let rssTitle = routeParams.get('title');
    if (!rssTitle) {
        const resp = await got({
            method: 'get',
            url: new URL(url).origin,
        });
        const $ = load(resp.data);
        rssTitle = $('title').text();
    }

    const items = jsonGet(response.data, routeParams.get('item')).map((item) => {
        let link = jsonGet(item, routeParams.get('itemLink')).trim();
        // 补全绝对链接
        if (link && !link.startsWith('http')) {
            link = `${new URL(url).origin}${link}`;
        }
        return {
            title: jsonGet(item, routeParams.get('itemTitle')),
            link,
            description: routeParams.get('itemDesc') ? jsonGet(item, routeParams.get('itemDesc')) : '',
            pubDate: routeParams.get('itemPubDate') ? jsonGet(item, routeParams.get('itemPubDate')) : '',
        };
    });

    ctx.set('data', {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    });
};
