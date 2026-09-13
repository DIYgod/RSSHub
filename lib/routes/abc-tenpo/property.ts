import { load } from 'cheerio';
import pMap from 'p-map';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseHeavyFood, parseJpy, parseWalkMin, parseWard, parseYmd, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const HOST = 'https://www.abc-tenpo.com';
const DETAIL_CONCURRENCY = 2;
const PAGE_SIZE = 20;

/** `pref[]` values of the search form (Kanto edition). */
const PREFECTURES = [
    { slug: 'tokyo', code: '13', label: '東京都' },
    { slug: 'kanagawa', code: '14', label: '神奈川県' },
    { slug: 'saitama', code: '11', label: '埼玉県' },
    { slug: 'chiba', code: '12', label: '千葉県' },
];

interface ListCard {
    title: string;
    link: string;
    image?: string;
    extra: ListingExtra;
}

interface DetailFields {
    updated_at: string | null; // 情報更新日 '2026/09/13'
    business_limit: string | null; // 業種制限 '中華料理、大衆居酒屋NG' | '無し'
    food_condition: string | null; // 飲食条件 '重飲食可' | '相談'
    structure: string | null; // 構造
    note: string | null; // 備考
}

/**
 * List page (`/property/search?sort=1`, 20 per page, server-rendered): card article.c-property-box,
 *   headline .c-property-box-footer__lead (fallback .c-property-box-header__title = station), link a.c-property-box__anchor,
 *   所在地 .c-property-box-header__area '神奈川県鎌倉市 / 駅から徒歩4分', dl rows dt.c-property-box-table__title → dd:
 *   賃料 '23.2万円', 初期費用 '268.0万円', 面積 '6.71坪 / 22.18㎡', 階層 '1階' | '地下1階' | '1階～2階一括', 最寄り駅 'JR横須賀線 鎌倉駅 徒歩4分',
 *   引渡状態 'スケルトン' | '居抜き', 現業態 'ダイニングバー'; tags .c-tag-property__item (狭小, 居抜き, 重飲食可 …), .c-property-box-main__tag--new
 * 保証金 / 礼金 / 造作譲渡料 are members-only on the site.
 */
const parseList = (html: string): ListCard[] => {
    const $ = load(html);
    return $('article.c-property-box')
        .toArray()
        .map((el): ListCard | null => {
            const $el = $(el);
            const href = $el.find('a.c-property-box__anchor').attr('href');
            const id = href?.match(/\/view\/(\d+)/)?.[1];
            const title = clean($el.find('.c-property-box-footer__lead').text()) ?? clean($el.find('.c-property-box-header__title').text());
            if (!href || !id || !title) {
                return null;
            }
            const cell = (label: string): string | null => {
                const dt = $el
                    .find('dt.c-property-box-table__title')
                    .toArray()
                    .find((d) => clean($(d).text()) === label);
                return dt ? clean($(dt).next('dd').text()) : null;
            };
            const raw: ListingExtra['raw'] = {
                station_title: clean($el.find('.c-property-box-header__title').text()),
                area_header: clean($el.find('.c-property-box-header__area').text()),
                rent: cell('賃料'),
                initial_cost: cell('初期費用'),
                area: cell('面積'),
                floor: cell('階層'),
                station: cell('最寄り駅'),
                condition: cell('引渡状態'),
                prev_business: cell('現業態'),
            };
            const tags = [
                ...$el
                    .find('.c-tag-property__item')
                    .toArray()
                    .map((t) => clean($(t).text())),
                $el.find('.c-property-box-main__tag--new').length > 0 ? 'NEW' : null,
            ].filter((t): t is string => t !== null);
            const [line, station] = (raw.station ?? '').split(' ', 2);
            // '東京都 中野区 / 駅から徒歩2分' → '東京都中野区'
            const address = clean(raw.area_header?.split('/', 1)[0])?.replaceAll(' ', '') ?? null;
            const rentJpy = parseJpy(raw.rent);
            const { tsubo, area_m2 } = parseArea(raw.area);
            const image = $el.find('.c-property-box-main__img img[src^="/img/bukken/"]').first().attr('src');

            return {
                title,
                link: new URL(href, HOST).href,
                image: image ? new URL(image, HOST).href : undefined,
                extra: {
                    source: 'abc-tenpo',
                    listing_id: id,
                    rent_jpy: rentJpy,
                    tsubo,
                    area_m2,
                    tsubo_unit_jpy: tsuboUnit(rentJpy, tsubo),
                    floor: normalizeFloor(raw.floor?.replaceAll('地下', 'B') ?? null),
                    station: clean(station)?.replace(/駅$/, '') ?? null,
                    line: clean(line),
                    walk_min: parseWalkMin(raw.station),
                    deposit_months: null,
                    deposit_jpy: null,
                    key_money_months: null,
                    fixtures_transfer_jpy: null,
                    condition: parseCondition(raw.condition),
                    prev_business: raw.prev_business === 'その他' ? null : raw.prev_business,
                    heavy_food_ok: tags.includes('重飲食可') ? true : null,
                    business_limit: null,
                    listed_at: null,
                    ward: parseWard(address),
                    address_hint: address,
                    tags,
                    raw,
                },
            };
        })
        .filter((c): c is ListCard => c !== null);
};

/** Detail page (`/property/view/{id}`): 物件情報 dl.c-table-a__def dt → dd; 情報更新日 in .p-property-updated-date__def. */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const cell = (label: string): string | null => {
        const dt = $('dl.c-table-a__def dt')
            .toArray()
            .find((d) => clean($(d).text()) === label);
        return dt ? clean($(dt).next('dd').text()) : null;
    };
    return {
        updated_at: clean($('.p-property-updated-date__def dd').first().text()),
        business_limit: cell('業種制限'),
        food_condition: cell('飲食条件'),
        structure: cell('構造'),
        note: cell('備考'),
    };
};

const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => {
    const limitParts = [d.business_limit === null || /^(?:無し|なし|-)$/.test(d.business_limit) ? null : d.business_limit, d.food_condition === null ? null : `飲食条件: ${d.food_condition}`].filter((p): p is string => p !== null);
    return {
        ...base,
        heavy_food_ok: base.heavy_food_ok ?? parseHeavyFood(d.food_condition),
        business_limit: limitParts.length > 0 ? limitParts.join(' / ') : null,
        // The site only publishes 情報更新日, which is used as the item date.
        listed_at: parseYmd(d.updated_at),
        raw: { ...base.raw, updated_at: d.updated_at, business_limit: d.business_limit, food_condition: d.food_condition, structure: d.structure, note: d.note },
    };
};

/** A failed detail page keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link)));
    } catch (error) {
        logger.warn(`abc-tenpo: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

export const handler = async (ctx): Promise<Data> => {
    const pref: string | undefined = ctx.req.param('pref');
    const prefecture = pref === undefined ? undefined : PREFECTURES.find((p) => p.slug === pref || p.code === pref);
    if (pref !== undefined && !prefecture) {
        throw new Error(`Unknown prefecture "${pref}", expected one of ${PREFECTURES.map((p) => p.slug).join(', ')}`);
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : PAGE_SIZE, PAGE_SIZE);
    // sort=1 is 新着順.
    const listUrl = `${HOST}/property/search?sort=1${prefecture ? `&pref%5B%5D=${prefecture.code}` : ''}`;

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
                    image: card.image,
                    _extra: extra,
                };
            }) as Promise<DataItem>,
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: `ABC店舗 新着物件${prefecture ? ` (${prefecture.label})` : ''}`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/property/:pref?',
    name: '新着物件',
    url: 'www.abc-tenpo.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/abc-tenpo/property/tokyo',
    parameters: {
        pref: {
            description: 'Prefecture slug or JIS X 0401 code; omit for all of 東京・神奈川・千葉・埼玉',
            options: PREFECTURES.map((p) => ({ value: p.slug, label: `${p.label} (${p.code})` })),
        },
    },
    description: `Listings on ABC 店舗 sorted by 新着順 (first page, 20 listings). Each item's \`_extra\` carries the structured listing fields (賃料，坪，階，最寄駅，引渡状態，現業態，業種制限，飲食条件，情報更新日，…) parsed from the list and detail pages; unknown values are \`null\`. 保証金，礼金 and 造作譲渡料 are members-only on the site and therefore always \`null\`; the item date is the site's 情報更新日.

| Query   | Description                                                                  | Default |
| ------- | ---------------------------------------------------------------------------- | ------- |
| \`limit\` | Number of listings to process (detail pages are fetched per listing), max 20 | 20      |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.abc-tenpo.com/property/search', 'www.abc-tenpo.com/feature/new_arrival', 'www.abc-tenpo.com/'],
            target: '/property',
        },
    ],
};
