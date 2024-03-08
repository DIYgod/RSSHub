import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

export const route: Route = {
    path: '/transform/html/:url/:routeParams',
    categories: ['other'],
    example: '/rsshub/transform/html/https%3A%2F%2Fwechat2rss.xlab.app%2Fposts%2Flist%2F/item=div%5Bclass%3D%27post%2Dcontent%27%5D%20p%20a',
    parameters: { url: '`encodeURIComponent`ed URL address', routeParams: 'Transformation rules, requires URL encode' },
    features: {
        requireConfig: true,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Transformation - HTML',
    maintainers: ['ttttmr'],
    handler,
};

async function handler(ctx) {
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

    return {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
}
