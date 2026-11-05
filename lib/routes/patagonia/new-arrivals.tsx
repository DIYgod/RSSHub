import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

const host = 'https://www.patagonia.com';
const categoryMap = {
    mens: ['mens-new', 'mens-new-arrivals'],
    womens: ['womens-new', 'womens-new-arrivals'],
    kids: ['kids-new-arrivals', 'kids-baby-new-arrivals'],
    luggage: ['luggage-new-arrivals', 'luggage-new-arrivals'],
};
function extractSfrmUrl(url) {
    const urlObj = new URL(url);
    const sfrmValue = urlObj.searchParams.get('sfrm');
    urlObj.search = new URLSearchParams({ sfrm: String(sfrmValue) }).toString();
    return urlObj.href;
}
export const route: Route = {
    path: '/new-arrivals/:category',
    categories: ['shopping'],
    example: '/patagonia/new-arrivals/mens',
    parameters: { category: 'category, see below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'New Arrivals',
    maintainers: ['IvanWng97'],
    handler,
    description: `| Men's | Women's | Kids' & Baby | Packs & Gear |
| ----- | ------- | ------------ | ------------ |
| mens  | womens  | kids         | luggage      |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    if (!Object.hasOwn(categoryMap, category)) {
        throw new InvalidParameterError('Category must be mens, womens, kids, or luggage.');
    }
    const url = `${host}/on/demandware.store/Sites-patagonia-us-Site/en_US/Search-LazyGrid`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            cgid: categoryMap[category][0],
            isLazyGrid: true,
        },
    });
    const data = response.data;

    const $ = load(data);
    const list = $('.product')
        .toArray()
        .map((element) => {
            const title = $(element).find('.product-tile__name').first().text();
            if (!title) {
                return null;
            }
            const pricing = $(element).find('product-tile-pricing').first();
            const data = {
                title,
                link: host + '/' + $(element).find('[itemprop="url"]').attr('href'),
                description: '',
                category: pricing.attr('primary-category'),
            };
            let imgUrl: string | URL = new URL($(element).find('[itemprop="image"]').attr('content')!);
            imgUrl = extractSfrmUrl(imgUrl);

            const price = pricing.attr('sale-price-formatted') ?? '';
            data.description =
                price +
                renderToString(
                    <div>
                        <img src={imgUrl} />
                    </div>
                );
            return data;
        })
        .filter((item) => item !== null);
    return {
        language: 'en' as const,
        title: `Patagonia - New Arrivals - ${category.toUpperCase()}`,
        link: `${host}/shop/${categoryMap[category][1]}`,
        description: `Patagonia - New Arrivals - ${category.toUpperCase()}`,
        item: list,
    };
}
