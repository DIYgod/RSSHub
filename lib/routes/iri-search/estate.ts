import { load } from 'cheerio';
import pMap from 'p-map';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseJpy, parseWalkMin, parseWard, parseYmd, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const HOST = 'https://www.iri-search.net';
const DETAIL_CONCURRENCY = 2;
const PAGE_SIZE = 30;

/** `area_code` values of the search form. */
const REGIONS = [
    { slug: 'shutoken', code: '1', label: '首都圏' },
    { slug: 'hokkaido', code: '2', label: '北海道' },
    { slug: 'tohoku', code: '3', label: '東北' },
    { slug: 'kitakanto', code: '4', label: '北関東' },
    { slug: 'hokuriku', code: '5', label: '北陸' },
    { slug: 'koshinetsu', code: '6', label: '甲信越' },
    { slug: 'tokai', code: '7', label: '東海' },
    { slug: 'kinki', code: '8', label: '近畿' },
    { slug: 'chugoku', code: '9', label: '中国' },
    { slug: 'shikoku', code: '10', label: '四国' },
    { slug: 'kyushu', code: '11', label: '九州' },
    { slug: 'okinawa', code: '12', label: '沖縄' },
];

/** 首都圏 prefectures (`prefectural_code`, JIS X 0401), the only ones paired with `area_code=1`. */
const PREFECTURES: Record<string, string> = {
    tokyo: '13',
    kanagawa: '14',
    saitama: '11',
    chiba: '12',
};

interface ListCard {
    title: string;
    link: string;
    extra: ListingExtra;
}

interface DetailFields {
    listed_at: string | null; // 掲載日 '2026/09/12'
    deposit: string | null; // 保証金・敷金 '2,443,638円'
    key_money: string | null; // 礼金 '448,000円'
    fixtures: string | null; // 居抜き譲渡代
    status: string | null; // 現況 '空室'
    note: string | null; // 備考
}

/**
 * List page (`/estate_search/index?...&order_by=6&hotlist=1`, 30 per page, server-rendered): each card is a
 * `.estate_link_title` row followed by a `table[summary="物件詳細2"]` row of th/td pairs:
 *   賃料 '445,500円(税込) (坪単価 11,013円)', 建物面積 '40.45坪（約133.72m²）', フロア '２階',
 *   沿線 '東急目黒線 武蔵小山駅 徒歩7分', 所在 '東京都品川区荏原3-5-14', 以前の業態 'スケルトン', 現(前)テナント,
 *   業種可否 nested table th.mini_th (サービス/物販/軽飲食/重飲食/娯楽) → td.center ('可' | '不可' | '相談' | '確認中')
 */
const parseList = (html: string): ListCard[] => {
    const $ = load(html);
    return $('#search_result .estate_link_title')
        .toArray()
        .map((el): ListCard | null => {
            const $el = $(el);
            const a = $el.find('a').first();
            const href = a.attr('href');
            const title = clean(a.text());
            const id = $el.find('input[name="inquiry[]"]').attr('value') ?? href?.match(/id=(\d+)/)?.[1];
            if (!href || !title || !id) {
                return null;
            }
            const table = $el.closest('tr').next('tr').find('table[summary="物件詳細2"]');
            const cell = (label: string): string | null => {
                const th = table
                    .find('th')
                    .toArray()
                    .find((t) => clean($(t).text()) === label);
                return th ? clean($(th).next('td').text()) : null;
            };
            const permissions = table
                .find('th.mini_th')
                .toArray()
                .map((t) => clean($(t).text()));
            const permissionValues = table
                .find('th.mini_th')
                .first()
                .closest('tr')
                .next('tr')
                .find('td')
                .toArray()
                .map((t) => clean($(t).text()));
            const heavyFood = permissionValues[permissions.indexOf('重飲食')] ?? null;

            const raw: ListingExtra['raw'] = {
                rent: cell('賃料'),
                area: cell('建物面積'),
                floor: cell('フロア'),
                station: cell('沿線'),
                address: cell('所在'),
                prev_business: cell('以前の業態'),
                tenant: cell('現(前)テナント'),
                building: cell('名称'),
                permissions: permissions.length > 0 ? permissions.map((p, i) => `${p}:${permissionValues[i] ?? ''}`).join(' / ') : null,
            };
            const [line, station] = (raw.station ?? '').split(' ', 2);
            const rentJpy = parseJpy(clean(raw.rent?.replace(/\(.*$/, '')));
            const { tsubo, area_m2 } = parseArea(raw.area);
            const tags = $el
                .closest('tr')
                .next('tr')
                .find('td.icon img')
                .toArray()
                .map((img) => $(img).attr('alt') ?? '')
                .filter((alt) => alt !== '' && !alt.includes('ではない'));

            return {
                title,
                link: new URL(href, HOST).href,
                extra: {
                    source: 'iri-search',
                    listing_id: id,
                    rent_jpy: rentJpy,
                    tsubo,
                    area_m2,
                    tsubo_unit_jpy: parseJpy(raw.rent?.match(/坪単価\s*([\d,]+円)/)?.[1] ?? null) ?? tsuboUnit(rentJpy, tsubo),
                    floor: normalizeFloor(raw.floor?.normalize('NFKC').replaceAll('地下', 'B') ?? null),
                    station: clean(station)?.replace(/駅$/, '') ?? null,
                    line: clean(line),
                    walk_min: parseWalkMin(raw.station),
                    deposit_months: null,
                    deposit_jpy: null,
                    key_money_months: null,
                    fixtures_transfer_jpy: null,
                    condition: parseCondition(raw.prev_business, title),
                    prev_business: raw.prev_business === 'スケルトン' ? null : raw.prev_business,
                    heavy_food_ok: heavyFood === '可' ? true : heavyFood === '不可' ? false : null,
                    business_limit: raw.permissions,
                    listed_at: null,
                    ward: parseWard(raw.address),
                    address_hint: raw.address,
                    tags,
                    raw,
                },
            };
        })
        .filter((c): c is ListCard => c !== null);
};

/** Detail page: th/td tables; some labels carry a ` *1` footnote suffix, so match by prefix. */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const cell = (label: string): string | null => {
        const th = $('th')
            .toArray()
            .find((t) => clean($(t).text())?.startsWith(label));
        return th ? clean($(th).next('td').text()) : null;
    };
    return {
        listed_at: cell('掲載日'),
        deposit: cell('保証金・敷金'),
        key_money: cell('礼金'),
        fixtures: cell('居抜き譲渡代'),
        status: cell('現況'),
        note: cell('備考'),
    };
};

const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => ({
    ...base,
    deposit_jpy: parseJpy(d.deposit),
    fixtures_transfer_jpy: parseJpy(d.fixtures),
    listed_at: parseYmd(d.listed_at),
    raw: { ...base.raw, listed_at: d.listed_at, deposit: d.deposit, key_money: d.key_money, fixtures: d.fixtures, status: d.status, note: d.note },
});

/** A failed detail page keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link)));
    } catch (error) {
        logger.warn(`iri-search: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

export const handler = async (ctx): Promise<Data> => {
    const area: string | undefined = ctx.req.param('area');
    const region = area === undefined ? undefined : REGIONS.find((r) => r.slug === area);
    const prefCode = area === undefined || region ? undefined : (PREFECTURES[area] ?? (Object.values(PREFECTURES).includes(area) ? area : undefined));
    if (area !== undefined && !region && !prefCode) {
        throw new Error(`Unknown area "${area}", expected a region (${REGIONS.map((r) => r.slug).join(', ')}) or a 首都圏 prefecture (${Object.keys(PREFECTURES).join(', ')})`);
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : PAGE_SIZE, PAGE_SIZE);
    const query = new URLSearchParams({ page_start_num: '0', order_by: '6', hotlist: '1' });
    if (region) {
        query.set('area_code', region.code);
    } else if (prefCode) {
        query.set('area_code', '1');
        query.set('prefectural_code', prefCode);
    }
    const listUrl = `${HOST}/estate_search/index?${query.toString()}`;

    const cards = parseList(await ofetch(listUrl)).slice(0, limit);
    const items = await pMap(
        cards,
        (card) =>
            cache.tryGet(card.link, async (): Promise<DataItem> => {
                const extra = await enrich(card);
                return {
                    title: card.title,
                    link: card.link,
                    guid: card.link,
                    pubDate: extra.listed_at === null ? undefined : timezone(parseDate(extra.listed_at, 'YYYY-MM-DD'), 9),
                    description: summarize(extra),
                    _extra: extra,
                };
            }) as Promise<DataItem>,
        { concurrency: DETAIL_CONCURRENCY }
    );

    const scope = region?.label ?? (prefCode === undefined ? '全国' : (Object.keys(PREFECTURES).find((k) => PREFECTURES[k] === prefCode) ?? prefCode));
    return {
        title: `iri-search 新着物件 (${scope})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/estate/:area?',
    name: '新着物件',
    url: 'www.iri-search.net',
    maintainers: ['pseudoyu'],
    handler,
    example: '/iri-search/estate/tokyo',
    parameters: {
        area: `Region slug (${REGIONS.map((r) => r.slug).join(', ')}) or a 首都圏 prefecture (tokyo, kanagawa, saitama, chiba or its JIS code); omit for nationwide`,
    },
    description: `New listings on 居抜き物件検索 iri-search sorted by 新着順 (first page, 30 listings). Each item's \`_extra\` carries the structured listing fields (賃料，坪，坪単価，階，最寄駅，保証金・敷金，居抜き譲渡代，以前の業態，業種可否，掲載日，…) parsed from the list and detail pages; unknown values are \`null\`.

| Query   | Description                                                                  | Default |
| ------- | ---------------------------------------------------------------------------- | ------- |
| \`limit\` | Number of listings to process (detail pages are fetched per listing), max 30 | 30      |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.iri-search.net/estate_search', 'www.iri-search.net/'],
            target: '/estate',
        },
    ],
};
