import { load } from 'cheerio';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseJpy, parseWalkMin, parseWard, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const HOST = 'https://bukenavi.jp';
const REGIONS = new Set(['kanto', 'kansai', 'tokai', 'kyushu']);

/**
 * One listing, from `/{region}/object/{id}` — the id-only URL serves the same page as the station-named one.
 *
 * The address is deliberately **not** improved here: ぶけなび truncates 住所 to the 町 for guests and says so
 * ('東京都新宿区歌舞伎町 ※詳細はお問い合わせください（住所詳細は会員限定）'), so the 丁目 is unreachable without
 * an account and this route cannot do better than the area route on that field. What it does add is everything
 * the list card omits: 乗降者数, 構造, 竣工年月, 立地, 間口, 業種, 不可業態, 営業年数 and 特記事項.
 */
const parseDetail = (html: string, region: string, id: string): DataItem | null => {
    const $ = load(html);

    const rows = new Map<string, string>();
    for (const tr of $('table.box__property__table tr').toArray()) {
        const key = clean($(tr).find('th').first().text());
        const value = clean($(tr).find('td').first().text());
        if (key !== null && !rows.has(key)) {
            rows.set(key, value ?? '');
        }
    }
    const row = (label: string): string | null => {
        const v = clean(rows.get(label) ?? null);
        return v === null || /^[ー—–－-]+$/.test(v) ? null : v;
    };

    const title = clean($('h1').first().text()) ?? clean($('title').text());
    if (title === null || rows.size === 0) {
        return null;
    }

    const raw: ListingExtra['raw'] = {
        address: row('住所'),
        rent: row('賃料'),
        station: row('最寄り駅'),
        line: row('沿線'),
        size: row('面積'),
        floor: row('階数'),
        passengers: row('乗降者数'),
        structure: row('構造'),
        built: row('竣工年月'),
        location_type: row('立地'),
        frontage: row('間口'),
        prev_business: row('前の業態'),
        years_open: row('営業年数'),
        business_types: row('業種'),
        excluded_business: row('不可業態'),
        notes: row('特記事項'),
    };

    // '1,419,000円 @4.73万円' — the 坪単価 follows the rent after an @.
    const [rentText, unitText] = (raw.rent ?? '').split('@', 2);
    // Same shape as the area route, so the two bukenavi routes stay comparable.
    const limitParts = [raw.business_types === null ? null : `可: ${raw.business_types}`, raw.excluded_business === null ? null : `不可: ${raw.excluded_business}`].filter((p): p is string => p !== null);
    const { tsubo, area_m2 } = parseArea(raw.size);
    const rentJpy = parseJpy(clean(rentText));

    const extra: ListingExtra = {
        source: 'bukenavi',
        listing_id: id,
        rent_jpy: rentJpy,
        tsubo,
        area_m2,
        tsubo_unit_jpy: parseJpy(clean(unitText)) ?? tsuboUnit(rentJpy, tsubo),
        floor: normalizeFloor(raw.floor?.replaceAll('地下', 'B') ?? null),
        station: clean(raw.station?.split('(', 1)[0] ?? null)?.replace(/駅$/, '') ?? null,
        line: raw.line,
        walk_min: parseWalkMin(raw.station),
        // 敷金 / 礼金 are not published on the guest view.
        deposit_months: null,
        deposit_jpy: null,
        key_money_months: null,
        fixtures_transfer_jpy: null,
        condition: parseCondition(title),
        prev_business: raw.prev_business,
        // As on the area route: the site states 不可業態 rather than 重飲食可否, so this is read off that list.
        heavy_food_ok: raw.excluded_business === null ? null : !/飲食/.test(raw.excluded_business),
        business_limit: limitParts.length > 0 ? limitParts.join(' / ') : null,
        // The site publishes no listing date.
        listed_at: null,
        ward: parseWard(raw.address),
        // Town-level only: the 丁目 is behind the site's own 会員限定 notice.
        address_hint: raw.address?.split('※', 1)[0]?.trim() ?? null,
        tags: [],
        raw,
    };

    const link = `${HOST}/${region}/object/${id}`;
    return {
        title,
        link,
        guid: link,
        description: [raw.notes, summarize(extra)].filter(Boolean).join(' / '),
        _extra: extra,
    };
};

export const handler = async (ctx): Promise<Data> => {
    const region: string = ctx.req.param('region') ?? 'kanto';
    const id: string = ctx.req.param('id');
    if (!REGIONS.has(region)) {
        throw new Error(`Unknown region "${region}", expected one of ${[...REGIONS].join(', ')}`);
    }
    if (!/^\d+$/.test(id)) {
        throw new Error(`Invalid id "${id}", expected the numeric 物件 id from a /object/{id} URL`);
    }
    const link = `${HOST}/${region}/object/${id}`;

    const item = (await cache.tryGet(`bukenavi:detail:${region}:${id}`, async () => parseDetail(await ofetch(link, { responseType: 'text' }), region, id))) as DataItem | null;
    if (item === null) {
        throw new Error(`bukenavi: listing ${id} could not be read; it may have been delisted`);
    }

    return {
        title: `ぶけなび ${item.title}`,
        link,
        language: 'ja',
        item: [item],
    };
};

export const route: Route = {
    path: '/detail/:id/:region?',
    name: '物件詳細',
    url: 'bukenavi.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/bukenavi/detail/54379',
    parameters: {
        id: {
            description: 'The numeric 物件 id, i.e. the `54379` in `https://bukenavi.jp/kanto/object/54379`',
        },
        region: {
            description: 'Region the listing belongs to; defaults to `kanto`',
            default: 'kanto',
            options: [...REGIONS].map((r) => ({ value: r, label: r })),
        },
    },
    description: `One listing on ぶけなび，for following a single property rather than a whole area — a listing's 賃料 and availability change over its life.

It adds what the area route's cards omit: 乗降者数 for the nearest station, 構造，竣工年月，立地，間口，業種，不可業態，営業年数 and 特記事項，plus exact 面積 and 階数.

**It does not improve the address.** ぶけなび truncates 住所 to the 町 for guests and says so on the page — 「東京都新宿区歌舞伎町 ※詳細はお問い合わせください（住所詳細は会員限定）」 — so the 丁目 is unreachable without an account, and \`address_hint\` stops at the 町 here exactly as it does on the area route. 敷金，礼金 and 造作 are likewise absent from the guest view, and the site publishes no listing date, so those fields stay \`null\`.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['bukenavi.jp/:region/object/:id'],
            target: '/detail/:id/:region',
        },
    ],
};
