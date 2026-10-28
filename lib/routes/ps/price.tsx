import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Price {
    basePrice: string;
    discountedPrice: string;
    endTime: string | null;
}

// The fields this route reads from the store's Apollo cache entries
interface CacheEntry {
    name?: string;
    products?: Array<{ __ref: string }>;
    edition?: { name: string } | null;
    platforms?: string[];
    skus?: Array<{ __ref: string }>;
    media?: Array<{ role: string; url: string }>;
    action?: { param: Array<{ name: string; value: string }> };
    meta?: { upSellService: string };
    price?: Price;
    local?: { discountBadgeText?: string; lowestRecentPrice?: string };
}

export const route: Route = {
    path: '/price/:id/:locale?',
    categories: ['game'],
    view: ViewType.Notifications,
    example: '/ps/price/10001538',
    parameters: {
        id: 'Concept or product ID from the store URL, such as `10001538` in `https://store.playstation.com/en-us/concept/10001538`',
        locale: 'Store locale from the URL, `en-us` by default',
    },
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
            source: ['store.playstation.com/:locale/concept/:id', 'store.playstation.com/:locale/product/:id'],
            target: '/price/:id/:locale',
        },
    ],
    name: 'Game Price',
    maintainers: ['pseudoyu'],
    handler,
    url: 'store.playstation.com',
    description: 'A concept ID lists every edition of the game, and a product ID lists only that product. A new item appears whenever the price or the end of the offer changes. PlayStation Plus prices and trials are not included.',
};

const renderDescription = (product: CacheEntry, price: Price, local: CacheEntry['local'], image?: string) =>
    renderToString(
        <>
            {image ? <img src={image} /> : null}
            <p>{[product.edition?.name, product.platforms?.join(' / ')].filter(Boolean).join(' · ')}</p>
            <p>
                {price.discountedPrice}
                {price.basePrice === price.discountedPrice ? null : (
                    <>
                        {' '}
                        <s>{price.basePrice}</s> {local?.discountBadgeText}
                    </>
                )}
            </p>
            {price.endTime ? <p>Offer ends {parseDate(Number(price.endTime)).toUTCString()}</p> : null}
            {local?.lowestRecentPrice ? <p>{local.lowestRecentPrice}</p> : null}
        </>
    );

async function handler(ctx) {
    const { id, locale = 'en-us' } = ctx.req.param();
    if (!/^[\w-]+$/.test(id) || !/^[a-z]{2}(?:-[a-z]{2,4}){1,2}$/.test(locale)) {
        throw new InvalidParameterError('Use the concept or product ID and the locale, such as en-us, from a PlayStation Store URL.');
    }
    const type = /^\d+$/.test(id) ? 'concept' : 'product';
    const link = `https://store.playstation.com/${locale}/${type}/${id}`;
    const html = await ofetch<string>(link);
    const $ = load(html);

    // The page embeds several Apollo cache snapshots, each holding part of every entity
    const cache = new Map<string, CacheEntry>();
    for (const element of $('script[id^="env:"]').toArray()) {
        const snapshot = Object.entries<CacheEntry>(JSON.parse($(element).text()).cache ?? {});
        for (const [key, value] of snapshot) {
            cache.set(key, { ...cache.get(key), ...value });
        }
    }
    const target = cache.get(type === 'concept' ? `Concept:${id}` : `Product:${id}`);
    if (!target?.name) {
        throw new NotFoundError(`The PlayStation Store has no ${type} ${id} in ${locale}.`);
    }

    const ctas = [...cache].filter(([key]) => key.startsWith('GameCTA:')).map(([, value]) => value);
    const keys = type === 'concept' ? (target.products ?? []).map((ref) => ref.__ref) : [`Product:${id}`];
    const items = keys.flatMap((key): DataItem[] => {
        const product = cache.get(key);
        const skus = new Set(product?.skus?.map((ref) => ref.__ref.replace('Sku:', '')));
        // PlayStation Plus upsells such as catalog access or trials are not a purchase price
        const cta = ctas.find((value) => value.meta?.upSellService === 'NONE' && skus.has(value.action?.param.find((param) => param.name === 'skuId')?.value ?? ''));
        if (!product?.name || !cta?.price) {
            return [];
        }
        const price = cta.price;
        const productLink = `https://store.playstation.com/${locale}/product/${key.replace('Product:', '')}`;
        const image = (product.media?.find((media) => media.role === 'EDITION_KEY_ART') ?? product.media?.find((media) => media.role === 'MASTER'))?.url;
        return [
            {
                title: `${product.name} ${price.discountedPrice}`,
                description: renderDescription(product, price, cta.local, image),
                link: productLink,
                guid: `${productLink}#${price.basePrice}-${price.discountedPrice}-${price.endTime ?? ''}`,
                image,
            },
        ];
    });

    return {
        title: `${target.name} - PlayStation Store`,
        link,
        item: items,
    };
}
