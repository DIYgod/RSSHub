import { load } from 'cheerio';

import type { Route } from '@/types';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/search/:keywords',
    categories: ['shopping'],
    example: '/ebay/search/sodimm+ddr4+16gb',
    parameters: { keywords: 'Keywords for search' },
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
            source: ['ebay.com/sch/i.html'],
            target: (params, url) => {
                const searchKeywords = new URL(url).searchParams.get('_nkw');
                return `/ebay/search/${searchKeywords}`;
            },
        },
    ],
    name: 'Search Results',
    maintainers: ['phoeagon'],
    handler: async (ctx) => {
        const { keywords } = ctx.req.param();
        const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keywords)}&_sop=10&_ipg=240`;

        const response = await ofetch(url);
        const $ = load(response);

        const items = $('.srp-results')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const titleElement = $item.find('.s-item__title, .s-card__title, .s-item__title--has-tags');
                const title = titleElement.text().replace(/^New Listing/i, '');
                const link = $item.find('.s-item__link, .s-card__link').attr('href');
                const price = $item.find('.s-item__price, .s-card__price').text().trim();
                const image =
                    $item.find('.s-item__image-img img, img.s-item__image-img').attr('src') ||
                    $item.find('.s-item__image-wrapper img').attr('src') ||
                    $item.find('.s-card__image-img img').attr('src') ||
                    $item.find('.s-item__image img').attr('src');

                if (!title || !link || title.toLowerCase().includes('shop on ebay') || price === '') {
                    return null;
                }

                const cleanedLink = new URL(link);
                cleanedLink.search = '';

                return {
                    title: `${title} - ${price}`,
                    link: cleanedLink.toString(),
                    description: `<img src="${image?.replace(/\.jpe?g$/i, '.webp')}"><br>Price: ${price}`,
                };
            })
            .filter(Boolean);

        logger.info(`Found ${items.length} items on eBay`);

        return {
            title: `eBay Search: ${keywords}`,
            link: url,
            item: items,
        };
    },
};
