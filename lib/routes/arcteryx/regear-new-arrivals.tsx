import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.resale.arcteryx.com';

type ProductVariant = {
    available: boolean;
    price: string;
    compare_at_price: string | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
};

type Product = {
    title: string;
    handle: string;
    body_html: string;
    published_at: string;
    updated_at: string;
    tags: string[];
    variants: ProductVariant[];
    images: Array<{ src: string }>;
    options: Array<{ name: string; position: number }>;
};

const formatPrice = (price: number) => price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function formatPriceRange(prices: number[]) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}

function getAvailableOptions(product: Product, variants: ProductVariant[], name: string) {
    const option = product.options.find((option) => option.name === name);
    if (!option) {
        return [];
    }

    return [...new Set(variants.map((variant) => [variant.option1, variant.option2, variant.option3][option.position - 1]).filter(Boolean))];
}

function getProductItem(product: Product): DataItem | undefined {
    const variants = product.variants.filter((variant) => variant.available);
    if (!variants.length) {
        return;
    }

    const sizes = getAvailableOptions(product, variants, 'Size');
    const conditions = getAvailableOptions(product, variants, 'Condition');
    const prices = variants.map((variant) => Number(variant.price));
    const originalPrices = variants.filter((variant) => variant.compare_at_price).map((variant) => Number(variant.compare_at_price));
    const image = product.images[0]?.src;

    return {
        title: product.title,
        link: `${host}/products/${product.handle}`,
        pubDate: product.published_at ? parseDate(product.published_at) : undefined,
        updated: product.updated_at ? parseDate(product.updated_at) : undefined,
        category: product.tags,
        image,
        description: renderToString(
            <div>
                <div>{raw(product.body_html || '')}</div>
                {sizes.length ? (
                    <>
                        Available Sizes: {sizes.join(', ')}
                        <br />
                    </>
                ) : null}
                {conditions.length ? (
                    <>
                        Condition: {conditions.join(', ')}
                        <br />
                    </>
                ) : null}
                {originalPrices.length ? (
                    <>
                        Original Price: {formatPriceRange(originalPrices)}
                        <br />
                    </>
                ) : null}
                Resale Price: {formatPriceRange(prices)}
                <br />
                {image ? <img src={image} /> : null}
            </div>
        ),
    };
}

export const route: Route = {
    path: '/regear/new-arrivals',
    categories: ['shopping'],
    example: '/arcteryx/regear/new-arrivals',
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
            source: ['www.resale.arcteryx.com/collections/new-arrivals', 'www.resale.arcteryx.com/'],
        },
        {
            source: ['regear.arcteryx.com/'],
        },
    ],
    name: 'Regear New Arrivals',
    maintainers: ['IvanWng97'],
    handler,
    url: 'www.resale.arcteryx.com/collections/new-arrivals',
};

async function handler() {
    const url = `${host}/collections/new-arrivals`;
    const requestedLimit = 24;
    const limit = Math.min(Math.max(requestedLimit, 1), 250);
    const response = await ofetch<{ products: Product[] }>(`${url}/products.json`, { query: { limit } });
    if (!Array.isArray(response.products)) {
        throw new TypeError('The Arc’teryx RESALE response did not contain a product list.');
    }

    return {
        title: 'Arcteryx - Regear - New Arrivals',
        link: url,
        description: 'Arcteryx - Regear - New Arrivals',
        item: response.products.map(getProductItem).filter((item): item is DataItem => Boolean(item)),
    };
}
