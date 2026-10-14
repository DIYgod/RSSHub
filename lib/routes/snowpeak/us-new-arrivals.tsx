import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.snowpeak.com';

interface Product {
    title: string;
    handle: string;
    published_at: string;
    tags: string[];
    body_html: string;
    variants: Array<{ title: string }>;
    images: Array<{ src: string }>;
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
    const response = await ofetch<{ products: Product[] }>(`${url}/products.json`);
    const list: DataItem[] = response.products.map((product) => ({
        title: product.title,
        link: `${host}/products/${product.handle}`,
        pubDate: product.published_at ? parseDate(product.published_at) : undefined,
        category: product.tags,
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
        title: 'Snow Peak - New Arrivals',
        link: url,
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
