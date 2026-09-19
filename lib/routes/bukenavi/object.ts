import { load } from 'cheerio';
import pMap from 'p-map';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseHeavyFood, parseJpy, parseWalkMin, parseWard, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

const HOST = 'https://bukenavi.jp';
/**
 * `initMap()` pins the map at the listing's own coordinates — googleMap('map', 区名, lat, lng, false).
 * The label is only the ward, but the pin is per-property: five 歌舞伎町 listings carry five different
 * pairs spread over ~265m × 440m, so this is finer than the 丁目 the 住所 field withholds.
 */
const MAP_CALL = /googleMap\(\s*'[^']*',\s*'[^']*',\s*'([\d.-]+)',\s*'([\d.-]+)'/;
const DETAIL_CONCURRENCY = 2;

const REGIONS = [
    { slug: 'kanto', label: '関東' },
    { slug: 'kansai', label: '関西' },
    { slug: 'tokai', label: '東海' },
];

/** JIS X 0401 codes accepted as `prefecture[]`; any two-digit code is passed through. */
const PREFECTURES: Record<string, string> = {
    tokyo: '13',
    kanagawa: '14',
    saitama: '11',
    chiba: '12',
    osaka: '27',
    kyoto: '26',
    hyogo: '28',
    aichi: '23',
};

interface ListCard {
    title: string;
    link: string;
    extra: ListingExtra;
    image?: string;
}

interface DetailFields {
    address: string | null; // 住所 '東京都目黒区目黒 ※詳細はお問い合わせください'
    line: string | null; // 沿線
    area: string | null; // 面積 '25.7坪 /84.94m2'
    prev_business: string | null; // 前の業態
    business_types: string | null; // 業種（可能）
    ng_business: string | null; // 不可業態
    note: string | null; // 特記事項
    lat: string | null; // map pin, per-property
    lng: string | null;
}

/**
 * List page (`/{region}/object/list?wanted=1`, 10 per page, 新着順 by default, server-rendered):
 *   card .box__property, title .box__property__title, link .box__property__info__to-detail a,
 *   路線/駅/徒歩 .box__property__info__station 'JR山手線/目黒駅 (徒歩約 4分)', 階 + 坪 .rent__size '1階、2階 25.7 坪',
 *   賃料 .rent__price em '105万円', 坪単価 .rent__price .unit-price '@4.09万円', PR .box__property__info__lead
 */
const parseList = (html: string, region: string): ListCard[] => {
    const $ = load(html);
    return $('.box__property')
        .toArray()
        .map((el): ListCard | null => {
            const $el = $(el);
            const href = $el.find('.box__property__info__to-detail a').attr('href');
            const title = clean($el.find('.box__property__title').text());
            const id = href?.match(/\/(\d+)$/)?.[1];
            if (!href || !title || !id) {
                return null;
            }
            const raw: ListingExtra['raw'] = {
                station: clean($el.find('.box__property__info__station').text()),
                size: clean($el.find('.rent__size').text()),
                rent: clean($el.find('.rent__price em').text()),
                tsubo_unit: clean($el.find('.rent__price .unit-price').text()),
                lead: clean($el.find('.box__property__info__lead').text()),
            };
            const [line, stationPart] = (raw.station ?? '').split('/', 2);
            // '1階、2階 25.7 坪' → floor text before the 坪 figure
            const tsuboText = raw.size?.match(/\d+(?:\.\d+)?\s*坪/)?.[0] ?? null;
            const floorText = tsuboText === null ? null : clean(raw.size?.slice(0, raw.size.indexOf(tsuboText)));
            const rentJpy = parseJpy(raw.rent);
            const { tsubo, area_m2 } = parseArea(tsuboText);
            const image = $el.find('.box__property__left__image img').attr('src');

            return {
                title,
                // The ID-only URL serves the same page as the station-named one and makes a stable guid.
                link: `${HOST}/${region}/object/${id}`,
                image: image && !image.includes('/img/') ? image.replace('//storage', '/storage') : undefined,
                extra: {
                    source: 'bukenavi',
                    listing_id: id,
                    rent_jpy: rentJpy,
                    tsubo,
                    area_m2,
                    tsubo_unit_jpy: parseJpy(raw.tsubo_unit) ?? tsuboUnit(rentJpy, tsubo),
                    floor: normalizeFloor(floorText),
                    station: clean(stationPart?.replace(/\(.*$/, ''))?.replace(/駅$/, '') ?? null,
                    line: clean(line),
                    walk_min: parseWalkMin(raw.station),
                    deposit_months: null,
                    deposit_jpy: null,
                    key_money_months: null,
                    fixtures_transfer_jpy: null,
                    condition: parseCondition(title),
                    prev_business: null,
                    heavy_food_ok: null,
                    business_limit: null,
                    listed_at: null,
                    ward: null,
                    address_hint: null,
                    tags: [],
                    raw,
                },
            };
        })
        .filter((c): c is ListCard => c !== null);
};

/** Detail page: `table.box__property__table tr > th + td`; 住所 is town-level for guests. */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const cell = (label: string): string | null => {
        const th = $('table.box__property__table th')
            .toArray()
            .find((el) => clean($(el).text()) === label);
        return th ? clean($(th).next('td').text()) : null;
    };
    return {
        address: cell('住所'),
        line: cell('沿線'),
        area: cell('面積'),
        lat: MAP_CALL.exec(html)?.[1] ?? null,
        lng: MAP_CALL.exec(html)?.[2] ?? null,
        prev_business: cell('前の業態'),
        business_types: cell('業種'),
        ng_business: cell('不可業態'),
        note: cell('特記事項'),
    };
};

const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => {
    const address = clean(d.address?.replace(/※.*$/, '')) ?? null;
    const { area_m2 } = parseArea(d.area);
    const limitParts = [d.business_types === null ? null : `可: ${d.business_types}`, d.ng_business === null ? null : `不可: ${d.ng_business}`].filter((p): p is string => p !== null);
    return {
        ...base,
        area_m2: area_m2 ?? base.area_m2,
        line: base.line ?? d.line,
        prev_business: d.prev_business,
        // Only an explicit 重飲食可 / 不可 counts. An NG list that does not use the word 飲食 is not a
        // yes: '中華・焼肉・焼き鳥・油の多い業態不可' is a heavy-food ban written out in full, and
        // '風営法不可' is about something else entirely. Both used to come through as `true`.
        heavy_food_ok: parseHeavyFood(d.ng_business, d.business_types),
        business_limit: limitParts.length > 0 ? limitParts.join(' / ') : null,
        ward: parseWard(address),
        address_hint: address,
        raw: { ...base.raw, address: d.address, line: d.line, area: d.area, prev_business: d.prev_business, business_types: d.business_types, ng_business: d.ng_business, note: d.note, lat: d.lat, lng: d.lng },
    };
};

/** A failed detail page keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link)));
    } catch (error) {
        logger.warn(`bukenavi: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

export const handler = async (ctx): Promise<Data> => {
    const regionSlug: string = ctx.req.param('region') ?? 'kanto';
    const region = REGIONS.find((r) => r.slug === regionSlug);
    if (!region) {
        throw new Error(`Unknown region "${regionSlug}", expected one of ${REGIONS.map((r) => r.slug).join(', ')}`);
    }
    const pref: string | undefined = ctx.req.param('pref');
    const prefCode = pref === undefined ? undefined : (PREFECTURES[pref] ?? pref);
    if (prefCode !== undefined && !/^\d{2}$/.test(prefCode)) {
        throw new Error(`Unknown prefecture "${pref}", expected a slug (${Object.keys(PREFECTURES).join(', ')}) or a two-digit JIS code`);
    }
    // 市区町村 codes are the prefecture's two digits plus three more (横浜市中区 = 14104), and the site pairs
    // them with prefecture[], so both are required and the pair is checked rather than trusted.
    const city: string | undefined = ctx.req.param('city');
    if (city !== undefined) {
        if (prefCode === undefined) {
            throw new Error('A city needs its prefecture too, e.g. /bukenavi/object/kanto/kanagawa/14104');
        }
        if (!/^\d{5}$/.test(city)) {
            throw new Error(`Invalid city "${city}", expected a 5-digit JIS X 0402 市区町村 code such as 14104`);
        }
        if (!city.startsWith(prefCode)) {
            throw new Error(`City "${city}" does not belong to prefecture ${prefCode}`);
        }
    }
    // wanted=1 limits the list to 募集中 listings.
    const listUrl = `${HOST}/${region.slug}/object/list?wanted=1${prefCode === undefined ? '' : `&prefecture%5B%5D=${prefCode}`}${city === undefined ? '' : `&city%5B%5D=${city}`}`;

    const cards = parseList(await ofetch(listUrl), region.slug);
    const items = await pMap(
        cards,
        (card) =>
            cache.tryGet(card.link, async (): Promise<DataItem> => {
                const extra = await enrich(card);
                return {
                    title: card.title,
                    link: card.link,
                    guid: card.link,
                    // The site does not publish a listing date; no pubDate is fabricated.
                    description: [extra.raw.lead, summarize(extra)].filter(Boolean).join(' / '),
                    image: card.image,
                    _extra: extra,
                };
            }) as Promise<DataItem>,
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: `ぶけなび 新着物件 (${region.label}${prefCode === undefined ? '' : ` ${pref}`}${city === undefined ? '' : ` ${city}`})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/object/:region?/:pref?/:city?',
    name: '新着物件',
    url: 'bukenavi.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/bukenavi/object/kanto/tokyo',
    parameters: {
        region: {
            description: 'Region',
            default: 'kanto',
            options: REGIONS.map((r) => ({ value: r.slug, label: r.label })),
        },
        pref: 'Prefecture slug (tokyo, kanagawa, saitama, chiba, osaka, kyoto, hyogo, aichi) or two-digit JIS X 0401 code; omit for the whole region',
        city: {
            description: 'Optional 市区町村, as a 5-digit JIS X 0402 code (横浜市中区 `14104`, 新宿区 `13104`). Requires `pref` and must belong to it; omit for the whole prefecture.',
        },
    },
    description: `New 居抜き listings on ぶけなび that are currently 募集中，newest first (first page, 10 listings) — for a region, a prefecture, or one 市区町村 when \`city\` is given. Each item's \`_extra\` carries the structured listing fields (賃料，坪，坪単価，階，最寄駅，前業態，業種制限，…) parsed from the list and detail pages; unknown values are \`null\`. The site does not publish listing dates, so items have no \`pubDate\`.

**The exact location is in \`raw.lat\` / \`raw.lng\`, not in the address.** ぶけなび truncates 住所 to the 町 for guests (「東京都新宿区歌舞伎町 ※詳細はお問い合わせください（住所詳細は会員限定）」), but the page's own map pin does not: \`initMap()\` is called with the listing's coordinates, and five 歌舞伎町 listings carry five different pairs spread over roughly 265m × 440m, so these are per-property positions rather than a geocode of the town. They are finer than the 丁目 the address withholds, and no account is needed for them.

\`city\` is a 5-digit JIS X 0402 code and the site pairs it with the prefecture, so both are required — \`/bukenavi/object/kanto/kanagawa/14104\` is 横浜市中区. A code that does not belong to \`pref\` is rejected rather than sent on.

Note that \`bukenavi.jp/{region}/area/{日本語}\` pages are SEO landing pages carrying no listings; the 市区町村 filter is the \`city[]\` parameter on the list endpoint, which is what this route uses.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['bukenavi.jp/:region/object/list', 'bukenavi.jp/:region'],
            target: '/object/:region',
        },
    ],
};
