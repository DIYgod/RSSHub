import { load } from 'cheerio';

import type { RentBenchmarkExtra } from '@/routes/temposmart/utils';
import { clean, parseJpy } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const PAGE = 'https://www.abc-tenpo.com/feature/rent';
const PAGE_CACHE_SECONDS = 24 * 60 * 60; // the figures change monthly at most

/** The site only publishes 東京23区 on this page (Kanto edition). */
const PREFECTURES = [{ slug: 'tokyo', label: '東京都' }];

/**
 * `/feature/rent`: one `.p-rent` block (東京23区) with `.p-rent__row` per ward:
 *   .p-rent__name '千代田区', .p-rent__price '28,032<span>円</span>', .p-rent__button a → /property/search?muni[]=141.
 * The page states only 「賃料相場は坪単価」 — no 平均 / 中央値 label, no sample count, no period and no 更新日.
 * The single figure is stored as `rent_per_tsubo_jpy` (statistic unspecified); avg / median / min / max stay null.
 */
const parseRows = (html: string, pref: string): DataItem[] => {
    const $ = load(html);
    const note = clean($('*:contains("賃料相場は坪単価")').last().text());
    return $('.p-rent .p-rent__row')
        .toArray()
        .map((el): DataItem | null => {
            const $el = $(el);
            const name = clean($el.find('.p-rent__name').text());
            const price = clean($el.find('.p-rent__price').text());
            const searchUrl = $el.find('.p-rent__button a').attr('href');
            const muni = searchUrl?.match(/muni(?:%5B%5D|\[\])=(\d+)/)?.[1];
            if (!name || !price) {
                return null;
            }
            const raw: RentBenchmarkExtra['raw'] = Object.fromEntries(
                (
                    [
                        ['price', price],
                        ['price_label', '賃料相場（坪単価）'],
                        ['search_url', searchUrl ?? null],
                        ['note', note],
                    ] as Array<[string, string | null]>
                ).filter((e): e is [string, string] => e[1] !== null)
            );
            const extra: RentBenchmarkExtra = {
                source: 'abc-tenpo',
                area_kind: 'ward',
                area_name: name,
                pref,
                rent_per_tsubo_jpy: parseJpy(price),
                rent_per_tsubo_median_jpy: null,
                rent_per_tsubo_avg_jpy: null,
                rent_per_tsubo_min_jpy: null,
                rent_per_tsubo_max_jpy: null,
                sample_count: null,
                period: null,
                raw,
            };
            const anchor = muni ? `muni-${muni}` : encodeURIComponent(name);
            return {
                title: `${name} 賃料相場`,
                link: `${PAGE}#${anchor}`,
                guid: `${PAGE}#${anchor}`,
                description: extra.rent_per_tsubo_jpy === null ? price : `賃料相場（坪単価） ${extra.rent_per_tsubo_jpy.toLocaleString('ja-JP')}円`,
                _extra: extra,
            };
        })
        .filter((item): item is DataItem => item !== null);
};

export const handler = async (ctx): Promise<Data> => {
    const slug: string = ctx.req.param('pref') ?? 'tokyo';
    const prefecture = PREFECTURES.find((p) => p.slug === slug);
    if (!prefecture) {
        throw new Error(`Unknown prefecture "${slug}"; the site only publishes ${PREFECTURES.map((p) => `${p.slug} (${p.label})`).join(', ')}`);
    }
    const html: string = await cache.tryGet(PAGE, () => ofetch(PAGE), PAGE_CACHE_SECONDS);
    return {
        title: `ABC店舗 エリア別賃料相場 (${prefecture.label})`,
        link: PAGE,
        language: 'ja',
        item: parseRows(html, prefecture.label),
    };
};

export const route: Route = {
    path: '/rent-benchmark/:pref?',
    name: 'エリア別賃料相場',
    url: 'www.abc-tenpo.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/abc-tenpo/rent-benchmark/tokyo',
    parameters: {
        pref: {
            description: 'Prefecture slug; the site currently publishes 東京23区 only',
            default: 'tokyo',
            options: PREFECTURES.map((p) => ({ value: p.slug, label: p.label })),
        },
    },
    description: `Ward-level restaurant-property rent benchmarks (坪単価) from ABC 店舗's エリア別の賃料相場 page, one item per 区 of 東京 23 区. The page gives a single unqualified 相場 figure per ward (「賃料相場は坪単価」, compiled from the site's own listings) — it is stored in \`_extra.rent_per_tsubo_jpy\` because the site does not say whether it is a mean or a median; 平均 / 中央値 / 最高 / 最低，sample count, period and 更新日 are not published and stay \`null\`. The page is cached for one day.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.abc-tenpo.com/feature/rent'],
            target: '/rent-benchmark',
        },
    ],
};
