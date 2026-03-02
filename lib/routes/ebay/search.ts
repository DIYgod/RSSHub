import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';

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
    name: 'Search Results',
    maintainers: ['phoeagon'],
    handler,
};

async function handler(ctx) {
    const { keywords } = ctx.req.param();
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keywords)}&_sop=10&_ipg=240`;

    logger.info(`Fetching eBay search results: ${url}`);
    const response = await ofetch(url);
    logger.info(`eBay response status: ${response instanceof Response ? response.status : 'unknown'}`);
    const $ = load(response);

    const items = $('.s-item, .s-card, .s-item__wrapper.clearfix')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const titleElement = $item.find('.s-item__title, .s-card__title, .s-item__title--has-tags');
            const title = titleElement.text().replace(/^New Listing/i, '').trim();
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

            return {
                title: `${title} - ${price}`,
                link,
                description: `<img src="${image}"><br>Price: ${price}`,
                category: 'eBay Search',
            };
        })
        .filter(Boolean);

    logger.info(`Found ${items.length} items on eBay`);

    return {
        title: `eBay Search: ${keywords}`,
        link: url,
        item: items,
    };
}
