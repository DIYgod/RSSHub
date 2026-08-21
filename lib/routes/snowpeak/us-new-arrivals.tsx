import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';

const host = 'https://www.snowpeak.com';

interface Product {
    title: string;
    handle: string;
    published_at: string;
    tags: string[];
    description: string;
    variants: Array<{ name: string }>;
    images: string[];
}

export const route: Route = {
    path: '/us/new-arrivals',
    categories: ['shopping'],
    example: '/snowpeak/us/new-arrivals',
    parameters: {},
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
            source: ['snowpeak.com/collections/new-arrivals', 'snowpeak.com/'],
        },
    ],
    name: 'New Arrivals(USA)',
    maintainers: ['IvanWng97'],
    handler,
    url: 'snowpeak.com/collections/new-arrivals',
};

async function handler() {
    const url = `${host}/collections/new-arrivals`;
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;

    const $ = load(data);
    const list = $('.element.product-tile')
        .toArray()
        .map((element) => {
            const product = $(element).find('.product-data').data('product') as Product;
            const data: DataItem = {
                title: product.title,
                link: `${host}/products/${product.handle}`,
                pubDate: new Date(product.published_at).toUTCString(),
                category: product.tags,
                description:
                    product.description +
                    renderToString(
                        <div>
                            Variant:
                            <br />
                            {product.variants.map((variant) => (
                                <>
                                    {variant.name}
                                    <br />
                                </>
                            ))}
                            {product.images.map((image) => (
                                <img src={image} />
                            ))}
                        </div>
                    ),
            };

            return data;
        });
    return {
        title: 'Snow Peak - New Arrivals',
        link: `${host}/new-arrivals`,
        description: 'Snow Peak - New Arrivals',
        item: list.map((item) => ({
            title: item.title,
            category: item.category,
            description: item.description,
            pubDate: item.pubDate,
            link: item.link,
        })),
    };
}
