import { load } from 'cheerio';
import pMap from 'p-map';

import type { RentBenchmarkExtra } from '@/routes/temposmart/utils';
import { clean, parseJpy } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const HOST = 'https://www.inshokuten.com';
const MARKET = `${HOST}/bukken/kanto/market/rent`;
const DETAIL_CONCURRENCY = 2;
const DETAIL_CACHE_SECONDS = 24 * 60 * 60; // the benchmarks change monthly at most

/** Area selection pages of the 首都圏 edition (`/market/rent/line/{slug}`); line ids on them are area-scoped. */
const AREAS = [
    { slug: '23ward', label: '東京23区', pref: '東京都' },
    { slug: '23ward_out', label: '東京都下', pref: '東京都' },
    { slug: 'chiba', label: '千葉', pref: '千葉県' },
    { slug: 'saitama', label: '埼玉', pref: '埼玉県' },
    { slug: 'yokohama_kawasaki', label: '神奈川', pref: '神奈川県' },
];

interface Target {
    name: string;
    url: string;
}

/** Selection pages list `<li><a href="…/result/?q[region_id]=10">千代田区</a>` (or `q[station_id]=243` for a line). */
const parseTargets = (html: string, param: 'region_id' | 'station_id'): Target[] => {
    const $ = load(html);
    return $(`a[href*="${param}"]`)
        .toArray()
        .map((a) => ({ name: clean($(a).text()) ?? '', url: new URL($(a).attr('href') ?? '', HOST).href }))
        .filter((t) => t.name !== '' && t.url.includes(param));
};

/** Lines are `<a href="…/market/rent/station/2">JR山手線</a>` on the area page; the numeric id is scoped to that area. */
const parseLines = (html: string): Array<{ id: string; name: string }> => {
    const $ = load(html);
    return $('a[href*="/market/rent/station/"]')
        .toArray()
        .map((a) => ({
            id:
                $(a)
                    .attr('href')
                    ?.match(/\/station\/(\d+)/)?.[1] ?? '',
            name: clean($(a).text()) ?? '',
        }))
        .filter((l) => l.id !== '' && l.name !== '');
};

/**
 * Detail page (`/market/rent/result/?q[region_id]=10` or `?q[line_id]=2&q[station_id]=243`):
 *   h2.rate '千代田区の店舗賃料相場情報（直近1年間）', #rate-total th → td: 平均坪単価 / 最高坪単価 / 最低坪単価 / 一番多い階,
 *   賃料分布図 hidden inputs js-circle-graph-val1..6 = listing counts per rent bucket (A: 20万円未満 … F: 100万円以上),
 *   yearly trend table (平均坪単価 by year). No 中央値 and no 更新日 are published.
 */
const parseDetail = (html: string, base: Pick<RentBenchmarkExtra, 'area_kind' | 'area_name' | 'pref'>): RentBenchmarkExtra => {
    const $ = load(html);
    const cell = (label: string): string | null => clean($(`#rate-total th:contains("${label}")`).first().next('td').text());
    const period =
        $('h2.rate')
            .first()
            .text()
            .match(/（([^）]+)）/)?.[1] ?? null;
    const buckets = $('input[name^="js-circle-graph-val"]')
        .toArray()
        .map((el) => Number($(el).attr('value')))
        .filter((n) => Number.isFinite(n));
    const trend = $('#rate-total')
        .eq(1)
        .find('tr')
        .toArray()
        .map((tr) => clean($(tr).text()))
        .filter((t): t is string => t !== null && /^\d{4}年/.test(t))
        .join(' / ');
    const raw: RentBenchmarkExtra['raw'] = Object.fromEntries(
        (
            [
                ['avg', cell('平均坪単価')],
                ['max', cell('最高坪単価')],
                ['min', cell('最低坪単価')],
                ['top_floor', cell('一番多い階')],
                ['distribution', buckets.length > 0 ? buckets.join(',') : null],
                ['distribution_buckets', clean($('.right-graf-ex').text())],
                ['trend', trend === '' ? null : trend],
            ] as Array<[string, string | null]>
        ).filter((e): e is [string, string] => e[1] !== null)
    );
    return {
        source: 'inshokuten',
        ...base,
        rent_per_tsubo_jpy: null,
        rent_per_tsubo_median_jpy: null,
        rent_per_tsubo_avg_jpy: parseJpy(raw.avg ?? null),
        rent_per_tsubo_min_jpy: parseJpy(raw.min ?? null),
        rent_per_tsubo_max_jpy: parseJpy(raw.max ?? null),
        sample_count: buckets.length > 0 ? buckets.reduce((a, b) => a + b, 0) : null,
        period,
        raw,
    };
};

const describe = (x: RentBenchmarkExtra): string =>
    [
        x.rent_per_tsubo_avg_jpy === null ? null : `平均坪単価 ${x.rent_per_tsubo_avg_jpy.toLocaleString('ja-JP')}円`,
        x.rent_per_tsubo_max_jpy === null ? null : `最高 ${x.rent_per_tsubo_max_jpy.toLocaleString('ja-JP')}円`,
        x.rent_per_tsubo_min_jpy === null ? null : `最低 ${x.rent_per_tsubo_min_jpy.toLocaleString('ja-JP')}円`,
        x.sample_count === null ? null : `${x.period ?? ''}${x.sample_count}件`,
        x.raw.top_floor === undefined ? null : `一番多い階 ${x.raw.top_floor}`,
    ]
        .filter((p): p is string => p !== null)
        .join(' / ');

const toItem = (target: Target, kind: RentBenchmarkExtra['area_kind'], pref: string): Promise<DataItem> =>
    cache.tryGet(
        target.url,
        async (): Promise<DataItem> => {
            const extra = parseDetail(await ofetch(target.url), { area_kind: kind, area_name: target.name, pref });
            return {
                title: `${extra.area_name} 賃料相場 ${extra.period ?? ''}`.trim(),
                link: `${target.url}#rate-total`,
                guid: target.url,
                description: describe(extra),
                _extra: extra,
            };
        },
        DETAIL_CACHE_SECONDS
    ) as Promise<DataItem>;

export const handler = async (ctx): Promise<Data> => {
    const slug: string = ctx.req.param('area') ?? '23ward';
    const lineId: string | undefined = ctx.req.param('line');
    const area = AREAS.find((a) => a.slug === slug);
    if (!area) {
        throw new Error(`Unknown area "${slug}", expected one of ${AREAS.map((a) => a.slug).join(', ')}`);
    }
    const areaUrl = `${MARKET}/line/${area.slug}`;
    const areaHtml: string = await cache.tryGet(areaUrl, () => ofetch(areaUrl), DETAIL_CACHE_SECONDS);

    if (lineId === undefined) {
        const wards = parseTargets(areaHtml, 'region_id');
        return {
            title: `飲食店.COM 賃料相場 (${area.label}・市区町村別)`,
            link: areaUrl,
            language: 'ja',
            item: await pMap(wards, (w) => toItem(w, 'ward', area.pref), { concurrency: DETAIL_CONCURRENCY }),
        };
    }

    const line = parseLines(areaHtml).find((l) => l.id === lineId);
    if (!line) {
        throw new Error(`Line ${lineId} is not listed for ${area.label}; see ${areaUrl} for its line ids`);
    }
    const lineUrl = `${MARKET}/station/${line.id}`;
    const stations = parseTargets(await cache.tryGet(lineUrl, () => ofetch(lineUrl), DETAIL_CACHE_SECONDS), 'station_id');
    return {
        title: `飲食店.COM 賃料相場 (${area.label}・${line.name}・駅別)`,
        link: lineUrl,
        language: 'ja',
        item: await pMap(stations, (s) => toItem(s, 'station', area.pref), { concurrency: DETAIL_CONCURRENCY }),
    };
};

export const route: Route = {
    path: '/rent-benchmark/:area?/:line?',
    name: '賃料相場',
    url: 'www.inshokuten.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/inshokuten/rent-benchmark/23ward',
    parameters: {
        area: {
            description: '首都圏 sub-area',
            default: '23ward',
            options: AREAS.map((a) => ({ value: a.slug, label: a.label })),
        },
        line: {
            description: 'Line id from the area page (`/bukken/kanto/market/rent/line/{area}`, e.g. `2` = JR山手線 in 東京23区); when given, one item per station on that line instead of one per 市区町村',
        },
    },
    description: `Restaurant-property rent benchmarks (坪単価, 消費税込み募集金額, 直近1年間) published by 飲食店.COM. Without \`line\` the feed has one item per 市区町村 of the area; with \`line\` one item per station on that line. Each item's \`_extra\` carries \`rent_per_tsubo_avg_jpy\` / \`_min_jpy\` / \`_max_jpy\` (円/坪/月), \`sample_count\` (sum of the 賃料分布図 buckets), \`period\` and the raw site text; the site publishes no 中央値 and no 更新日, so \`rent_per_tsubo_median_jpy\` is always \`null\` and items carry no \`pubDate\`. Detail pages are cached for one day.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.inshokuten.com/bukken/kanto/market/rent/line/:area'],
            target: '/rent-benchmark/:area',
        },
        {
            source: ['www.inshokuten.com/bukken/kanto/market/rent/station/:line'],
            target: '/rent-benchmark/23ward/:line',
        },
    ],
};
