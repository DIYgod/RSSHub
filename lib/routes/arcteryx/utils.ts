import { load } from 'cheerio';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';

import { renderProductDescription } from './templates/product-description';

type Product = {
    name: string;
    slug: string;
    shortDescription?: string;
    currencyCode: string;
    price: number;
    discountPrice: number;
    selectedColour?: { image?: { url: string } };
    mainImage?: { url: string };
};

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);

function generateRssData(item: Product, productUrl: string): DataItem {
    const currentPrice = item.discountPrice ?? item.price;
    const image = item.selectedColour?.image?.url || item.mainImage?.url;

    return {
        title: item.name,
        link: new URL(item.slug, productUrl).href,
        image,
        description: renderProductDescription({
            shortDescription: item.shortDescription,
            originalPrice: currentPrice < item.price ? formatPrice(item.price, item.currencyCode) : undefined,
            price: formatPrice(currentPrice, item.currencyCode),
            image,
        }),
    };
}

export async function getProductList(pageUrl: string, productUrl: string): Promise<DataItem[]> {
    const response = await ofetch<string>(pageUrl);
    const $ = load(response);
    const state = $('#__NEXT_DATA__').text();
    if (!state) {
        throw new Error('The Arc’teryx catalog page did not contain its product data.');
    }
    const products: Product[] = JSON.parse(state).props?.pageProps?.initialProductList;
    if (!Array.isArray(products)) {
        throw new TypeError('The Arc’teryx catalog response did not contain a product list.');
    }

    return products.map((item) => generateRssData(item, productUrl));
}
