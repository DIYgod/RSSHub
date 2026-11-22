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
    selectedColour: { image: { url: string } };
};

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);

function generateRssData(item: Product, productUrl: string): DataItem {
    const image = item.selectedColour.image.url;

    return {
        title: item.name,
        link: new URL(item.slug, productUrl).href,
        image,
        description: renderProductDescription({
            shortDescription: item.shortDescription,
            originalPrice: item.discountPrice < item.price ? formatPrice(item.price, item.currencyCode) : undefined,
            price: formatPrice(item.discountPrice, item.currencyCode),
            image,
        }),
    };
}

export async function getProductList(pageUrl: string, productUrl: string): Promise<DataItem[]> {
    const response = await ofetch<string>(pageUrl);
    const state = response.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s)?.[1];
    if (!state) {
        throw new Error('The Arc’teryx catalog page did not contain its product data.');
    }
    const products: Product[] = JSON.parse(state).props.pageProps.initialProductList;

    return products.map((item) => generateRssData(item, productUrl));
}
