import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://zagg.com/en-us';

interface Product {
    title: string;
    handle: string;
    published_at: string;
    vendor: string;
    product_type: string;
    body_html: string;
    variants: Array<{ title: string }>;
    images: Array<{ src: string }>;
}

export const route: Route = {
    path: '/new-arrivals/:query?',
    categories: ['shopping'],
    example: '/zagg/new-arrivals/vendor=ZAGG,InvisibleShield&product_type=cases',
    parameters: { query: 'query string, `vendor` and `product_type`, comma separated' },
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
    description: 'Filter by vendor (`ZAGG`, `InvisibleShield`, `ZAGG Custom`...) and product type (`cases`, `screen protectors`, `tablet keyboards`...), e.g. `vendor=ZAGG&product_type=cases,tablet cases`',
};

async function handler(ctx) {
    const params = new URLSearchParams(ctx.req.param('query'));
    const vendors = params.get('vendor')?.split(',');
    const types = params.get('product_type')?.split(',');

    const url = `${host}/collections/new-arrivals`;
    const response = await ofetch<{ products: Product[] }>(`${url}/products.json`, {
        query: { limit: 250 },
    });
    const list: DataItem[] = response.products
        .filter((product) => (!vendors || vendors.includes(product.vendor)) && (!types || types.includes(product.product_type)))
        .map((product) => ({
            title: product.title,
            link: `${host}/products/${product.handle}`,
            pubDate: parseDate(product.published_at),
            category: [product.vendor, product.product_type],
            description:
                product.body_html +
                renderToString(
                    <div>
                        Variant:
                        <br />
                        {product.variants.map((variant) => (
                            <>
                                {variant.title}
                                <br />
                            </>
                        ))}
                        {product.images.map((image) => (
                            <img src={image.src} />
                        ))}
                    </div>
                ),
        }));
    return {
        title: 'Zagg - New Arrivals',
        link: url,
        description: 'Zagg - New Arrivals',
        item: list,
    };
}
