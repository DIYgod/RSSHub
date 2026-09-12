import type { Context } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '../lib/routes/uniqlo/new';
import type { Data } from '../lib/types';
import got from '../lib/utils/got';

vi.mock('../lib/utils/got', () => ({ default: vi.fn() }));

const product = {
    productId: 'E489455-000',
    name: 'HEATTECH Half Socks Pile',
    prices: { base: { currency: { symbol: '$' }, value: 7.9 } },
    images: {
        main: {
            '17': { image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/489455/item/goods_17_489455_3x4.jpg' },
            '09': { image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/489455/item/goods_09_489455_3x4.jpg' },
        },
        sub: [{ image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/489455/sub/goods_489455_sub21_3x4.jpg' }],
    },
};

const invoke = async (country: string) => (await route.handler({ req: { param: () => ({ country, category: 'men' }) } } as unknown as Context)) as Data;

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(got).mockResolvedValue({ data: { result: { items: [product] } } });
});

describe('Uniqlo new arrivals', () => {
    it('requests the current Singapore API with the storefront client and new arrival flags', async () => {
        const feed = await invoke('sg');

        expect(got).toHaveBeenCalledExactlyOnceWith('https://www.uniqlo.com/sg/api/commerce/v5/en/products', {
            headers: { 'x-fr-clientid': 'uq.sg.web-spa' },
            searchParams: { path: 5856, flagCodes: 'salesStart,newSKU', sort: 1, limit: 24, offset: 0, httpFailure: true },
        });
        expect(feed).toMatchObject({ title: 'Uniqlo men new arrivals in sg', link: 'https://www.uniqlo.com/sg/en/feature/new/men/' });
        expect(feed.item).toEqual([
            {
                title: product.name,
                link: 'https://www.uniqlo.com/sg/en/products/E489455-000',
                description: `<br><br>Price: $7.9<br><br><img src="${product.images.main['17'].image}"><img src="${product.images.main['09'].image}"><img src="${product.images.sub[0].image}">`,
            },
        ]);
    });

    it.each([
        { country: 'us', language: 'en', path: 22211 },
        { country: 'jp', language: 'ja', path: 1072 },
    ])('preserves the $country endpoint, category and language without Singapore flags', async ({ country, language, path }) => {
        const feed = await invoke(country);

        expect(got).toHaveBeenCalledExactlyOnceWith(`https://www.uniqlo.com/${country}/api/commerce/v5/${language}/products`, {
            headers: { 'x-fr-clientid': `uq.${country}.web-spa` },
            searchParams: { path, flagCodes: undefined, sort: 1, limit: 24, offset: 0, httpFailure: true },
        });
        expect(feed.link).toBe(`https://www.uniqlo.com/${country}/${language}/feature/new/men/`);
        expect(feed.item[0].link).toBe(`https://www.uniqlo.com/${country}/${language}/products/E489455-000`);
    });

    it('preserves full titles, descriptions and legacy image arrays when optional subimages are absent', async () => {
        const name = 'A product name with descriptive details '.repeat(5);
        vi.mocked(got).mockResolvedValue({
            data: {
                result: {
                    items: [{ ...product, name, longDescription: '<p>Soft and warm.</p>', images: { main: [{ url: 'https://image.uniqlo.com/main.jpg' }] } }],
                },
            },
        });

        const feed = await invoke('sg');

        expect(feed.item).toEqual([
            {
                title: name,
                link: 'https://www.uniqlo.com/sg/en/products/E489455-000',
                description: '<p>Soft and warm.</p><br><br>Price: $7.9<br><br><img src="https://image.uniqlo.com/main.jpg">',
            },
        ]);
        expect(feed.item[0].pubDate).toBeUndefined();
    });
});
