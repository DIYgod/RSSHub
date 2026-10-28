import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { formatDate } from './templates/description';

interface SearchProduct {
    product_id: string;
    discount?: { start_date: number };
}

interface SearchTitle {
    latest_product_id: string;
    products: SearchProduct[];
}

interface Product {
    product_id: string;
    work_name: string;
    description: string;
    release_date?: number;
    image_main?: { original_url: string };
    maker?: { maker_name: string };
    authors: Array<{ author_name: string }>;
    genres: Array<{ genre_name: string }>;
    currency_price: { JPY: number };
    discount?: { discount_rate: number; end_date: number };
}

const rootUrl = 'https://www.comipo.app';

function getProduct(productId: string) {
    return cache.tryGet(`dlsite:comipo:${productId}`, async () => {
        const response = await ofetch<{ meta: { code: number }; data: Product }>(`${rootUrl}/api/comipo/product/${productId}`, {
            query: { product_id: productId, locale: 'ja_JP' },
        });
        if (response.meta?.code !== 200 || response.data?.product_id !== productId) {
            throw new Error('The official comipo API did not provide the requested product.');
        }
        return response.data;
    });
}

export async function getComicFeed(ctx: Context, campaign = false): Promise<Data> {
    const free = campaign && ctx.req.param('free') !== undefined;
    const selection: Record<string, string> = campaign ? (free ? { is_free: '1' } : { is_discount: '1' }) : {};
    const query = { order: 'release_d', ...selection, work_languages: 'JPN' };
    const link = `${rootUrl}/search?${new URLSearchParams(query)}`;
    const response = await ofetch<{ meta: { code: number }; data: { titles: SearchTitle[] } }>(`${rootUrl}/api/search/fetchSearchTitles`, {
        query: { ...query, page: 1, limit: 30, locale: 'ja_JP' },
    });
    if (response.meta?.code !== 200 || !Array.isArray(response.data?.titles)) {
        throw new Error('The official comipo search API did not provide its first-page product list.');
    }

    // New releases link to the native latest-volume action; campaigns use matching products.
    let candidates: SearchProduct[] = campaign ? response.data.titles.flatMap((title) => title.products).slice(0, 30) : response.data.titles.map((title) => ({ product_id: title.latest_product_id }));
    candidates = new Map(candidates.map((product) => [product.product_id, product])).values().toArray();
    const limit = getRouteLimit(ctx);
    if (ctx.req.query('sorted') === 'false' && limit) {
        candidates = candidates.slice(0, limit);
    }
    const items = await pMap(
        candidates,
        async (candidate): Promise<DataItem> => {
            const product = await getProduct(candidate.product_id);
            const published = campaign && !free ? candidate.discount?.start_date : product.release_date;
            return {
                title: product.work_name,
                link: `${rootUrl}/product/${product.product_id}`,
                pubDate: published ? parseDate(published, 'X') : undefined,
                author: [...new Set([product.maker?.maker_name, ...product.authors.map((author) => author.author_name)].filter(Boolean))].join(' / '),
                category: product.genres.map((genre) => genre.genre_name),
                description: renderToString(
                    <>
                        {product.description ? <p>{product.description}</p> : undefined}
                        <p>価格 (JPY): {product.currency_price.JPY} 円</p>
                        {product.discount ? (
                            <p>
                                割引: {product.discount.discount_rate}% / 割引終了時間: {formatDate(parseDate(product.discount.end_date, 'X'))}
                            </p>
                        ) : undefined}
                        {product.image_main?.original_url ? <img src={new URL(product.image_main.original_url, rootUrl).href} /> : undefined}
                    </>
                ),
            };
        },
        { concurrency: 3 }
    );
    return {
        title: campaign ? 'comipo | 割引中の作品' : 'comipo | 新刊',
        link,
        language: 'ja',
        item: items,
    };
}
