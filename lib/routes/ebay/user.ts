import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: ['/user/:username'],
    categories: ['shopping'],
    example: '/ebay/user/m.trotters',
    parameters: { username: 'Username of the seller' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ebay.com/usr/:username'],
            target: '/user/:username',
        },
    ],
    name: 'User Listings',
    maintainers: ['phoeagon'],
    handler: async (ctx) => {
        const { username } = ctx.req.param();
        const url = `https://www.ebay.com/usr/${username}`;

        const response = await ofetch(url);
        const $ = load(response);

        const items = $('article.str-item-card.StoreFrontItemCard')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const title = $item.find('.str-card-title .str-text-span').first().text().trim();
                const link = $item.find('.str-item-card__link').attr('href');
                const price = $item.find('.str-item-card__property-displayPrice').text().trim();
                const image = $item.find('.str-image img').attr('src');

                if (!title || !link) {
                    return null;
                }

                const cleanedLink = new URL(link);
                cleanedLink.search = '';

                return {
                    title: `${title} - ${price}`,
                    link: cleanedLink.toString(),
                    description: `<img src="${image?.replace(/\.jpe?g$/i, '.webp')}"><br>Price: ${price}`,
                    author: username,
                };
            })
            .filter(Boolean);

        return {
            title: `eBay User: ${username}`,
            link: url,
            item: items,
        };
    },
};
