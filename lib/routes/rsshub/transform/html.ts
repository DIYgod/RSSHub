// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

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
    const $ = load(response.data);
    const rssTitle = routeParams.get('title') || $('title').text();
    const item = routeParams.get('item') || 'html';
    const items = $(item)
        .toArray()
        .map((item) => {
            try {
                item = $(item);

                const titleEle = routeParams.get('itemTitle') ? item.find(routeParams.get('itemTitle')) : item;
                const title = routeParams.get('itemTitleAttr') ? titleEle.attr(routeParams.get('itemTitleAttr')) : titleEle.text();

                let link;
                const linkEle = routeParams.get('itemLink') ? item.find(routeParams.get('itemLink')) : item;
                if (routeParams.get('itemLinkAttr')) {
                    link = linkEle.attr(routeParams.get('itemLinkAttr'));
                } else {
                    link = linkEle.is('a') ? linkEle.attr('href') : linkEle.find('a').attr('href');
                }
                // 补全绝对链接
                link = link.trim();
                if (link && !link.startsWith('http')) {
                    link = `${new URL(url).origin}${link}`;
                }

                const descEle = routeParams.get('itemDesc') ? item.find(routeParams.get('itemDesc')) : item;
                const desc = routeParams.get('itemDescAttr') ? descEle.attr(routeParams.get('itemDescAttr')) : descEle.html();

                const pubDateEle = routeParams.get('itemPubDate') ? item.find(routeParams.get('itemPubDate')) : item;
                const pubDate = routeParams.get('itemPubDateAttr') ? pubDateEle.attr(routeParams.get('itemPubDateAttr')) : pubDateEle.html();

                return {
                    title,
                    link,
                    description: desc,
                    pubDate,
                };
            } catch {
                return null;
            }
        })
        .filter(Boolean);

    ctx.set('data', {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    });
};
