import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface GalleryItem {
    id: number;
    imageUrl: string;
    details: {
        retailer: string;
        variety: string;
        origin: string;
        weight: string;
        pack: string;
        price: string;
        year: number;
        week: number;
        isBio: boolean;
    };
}

const baseUrl = 'https://www.fruitdatakings.com';

const handler = async (ctx) => {
    // Use ctx.params and ctx.query which are standard in RSSHub route handlers
    const region = ctx.params.region || 'China';
    const product = ctx.params.product || 'cherry';
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 15;

    const cacheKey = `fruitdatakings:${region}:${product}`;
    const apiUrl = `${baseUrl}/ajax/gallery-proxy/?location=${encodeURIComponent(
        region,
    )}&product=${encodeURIComponent(product)}`;

    const data = (await cache.tryGet(cacheKey, async () => {
        return await ofetch(apiUrl, {
            headers: {
                'User-Agent': config.trueUA,
            },
        });
    }, 2 * 60 * 60)) as GalleryItem[];

    if (!Array.isArray(data) || data.length === 0) {
        // Throwing via ctx.throw is consistent with RSSHub error handling
        ctx.throw(404, 'No data found for the given region and product');
    }

    const items: DataItem[] = data.slice(0, limit).map((item) => {
        const { details } = item;
        const articleLink = `${baseUrl}/${region.toLowerCase()}/${product.toLowerCase()}/${item.id}/`;

        const description = `<p><strong>${details.variety}</strong> from <strong>${details.origin}</strong></p>
<p>Retailer: ${details.retailer}</p>
<p>Price: ${details.price} per ${details.pack} (${details.weight}g)</p>
${details.isBio ? '<p>Organic (Bio)</p>' : ''}
<img src="${item.imageUrl}" alt="${details.variety} price photo" />`;

        return {
            title: `${details.variety} (${details.origin}) - ${details.retailer} - ${details.price} per ${details.pack} (${details.weight}g)`,
            description,
            link: articleLink,
            guid: `fruitdatakings-${region}-${product}-${item.id}`,
            category: [details.variety, details.origin],
            pubDate: parseDate(`${details.year}-W${String(details.week).padStart(2, '0')}`, 'YYYY-Www'),
        };
    });

    ctx.state.data = {
        title: `Fruit Data Kings - ${product} - ${region}`,
        description: `Weekly ${product} market price data for ${region} from Fruit Data Kings`,
        link: `${baseUrl}/${region.toLowerCase()}/${product.toLowerCase()}/`,
        item: items,
        allowEmpty: false,
        image: `${baseUrl}/static/images/blue.1.png`,
    };
};

export const route: Route = {
    path: '/:region{.+}/:product{.+}',
    name: 'Fruit Price Data',
    url: 'fruitdatakings.com',
    maintainers: ['ishowman'],
    handler,
    example: '/fruitdatakings/China/cherry',
    parameters: {
        region: 'Region name, e.g. China, EU, US',
        product: 'Product slug, e.g. cherry, kiwi',
    },
    description: `
    | Region | Product | RSSHub Route |
    | --- | --- | --- |
    | China | Cherry | [/fruitdatakings/China/cherry](https://rsshub.app/fruitdatakings/China/cherry) |
    | EU | Kiwi | [/fruitdatakings/EU/kiwi](https://rsshub.app/fruitdatakings/EU/kiwi) |
`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['fruitdatakings.com/:region/:product/'],
            target: '/:region/:product',
        },
    ],
};
