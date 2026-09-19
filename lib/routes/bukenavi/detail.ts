import { load } from 'cheerio';

import { memberCookie } from '@/routes/bukenavi/utils';
import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseHeavyFood, parseJpy, parseMonths, parseWalkMin, parseWard, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const HOST = 'https://bukenavi.jp';
/**
 * `initMap()` pins the map at the listing's own coordinates — googleMap('map', 区名, lat, lng, false).
 * The label it passes is only the ward, which is why the page looks ward-level, but the pin is not:
 * five 歌舞伎町 listings carry five different pairs, spread over ~265m × 440m. So the exact location is
 * published to guests even though 住所 stops at the 町.
 */
const MAP_CALL = /googleMap\(\s*'[^']*',\s*'[^']*',\s*'([\d.-]+)',\s*'([\d.-]+)'/;
const REGIONS = new Set(['kanto', 'kansai', 'tokai', 'kyushu']);

/**
 * One listing, from `/{region}/object/{id}` — the id-only URL serves the same page as the station-named one.
 *
 * 住所 is truncated to the 町 for guests ('東京都新宿区歌舞伎町 ※詳細はお問い合わせください（住所詳細は会員限定）'),
 * so `address_hint` stops there — but the page's own map pin does not, and `raw.lat` / `raw.lng` carry the
 * listing's exact coordinates without an account. It also adds everything the list card omits: 乗降者数,
 * 構造, 竣工年月, 立地, 間口, 業種, 不可業態, 営業年数 and 特記事項.
 */
const parseDetail = (html: string, region: string, id: string): DataItem | null => {
    const $ = load(html);
    const map = MAP_CALL.exec(html);

    const rows = new Map<string, string>();
    // The member view puts 物件名 and 居抜き・スケルトン in an unclassed table and the fee rows in
    // `table.condition`, so every table is scanned. First label wins, and `box__property__table`
    // comes first in the document, so shared labels such as 賃料 keep their guest-view shape.
    for (const tr of $('table tr').toArray()) {
        const key = clean($(tr).find('th').first().text());
        const value = clean($(tr).find('td').first().text());
        if (key !== null && !rows.has(key)) {
            rows.set(key, value ?? '');
        }
    }
    const row = (...labels: string[]): string | null => {
        for (const label of labels) {
            const v = clean(rows.get(label) ?? null);
            if (v !== null && !/^[ー—–－-]+$/.test(v)) {
                return v;
            }
        }
        return null;
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
        excluded_business: row('不可業態', '不可業種'),
        notes: row('特記事項'),
        // 会員限定: null for a guest, which is exactly what an upstream user with no account sees.
        building: row('物件名'),
        deposit: row('保証金・敷金'),
        key_money: row('礼金'),
        amortisation: row('償却'),
        common_fee: row('共益費'),
        fixtures: row('造作譲渡金額'),
        contract_years: row('契約年数'),
        handover: row('引渡し時期'),
        seats: row('座席'),
        condition_text: row('居抜き・スケルトン'),
        kitchen: row('厨房設備'),
        kitchen_waterproof: row('厨房防水'),
        aircon: row('エアコン'),
        lat: map?.[1] ?? null,
        lng: map?.[2] ?? null,
    };

    // '1,419,000円 @4.73万円' — the 坪単価 follows the rent after an @.
    const [rentText, unitText] = (raw.rent ?? '').split('@', 2);
    // Same shape as the area route, so the two bukenavi routes stay comparable.
    const limitParts = [raw.business_types === null ? null : `可: ${raw.business_types}`, raw.excluded_business === null ? null : `不可: ${raw.excluded_business}`].filter((p): p is string => p !== null);
    const { tsubo, area_m2 } = parseArea(raw.size);
    const rentJpy = parseJpy(clean(rentText));
    // A guest sees '東京都新宿区歌舞伎町 ※詳細は…'; a member sees '東京都新宿区歌舞伎町 2-9-10 G1ビル'.
    // The 物件名 is trimmed back off so the address stays an address — the building keeps its own field.
    const fullAddress = raw.address?.split('※', 1)[0]?.trim() ?? null;
    const address = raw.building !== null && fullAddress?.endsWith(raw.building) ? clean(fullAddress.slice(0, -raw.building.length)) : fullAddress;

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
        // 会員限定, so null for a guest.
        deposit_months: parseMonths(raw.deposit),
        deposit_jpy: null,
        key_money_months: parseMonths(raw.key_money),
        fixtures_transfer_jpy: parseJpy(raw.fixtures),
        // 居抜き・スケルトン is a 会員限定 field; the title is the guest's only statement of it.
        condition: parseCondition(raw.condition_text, title),
        prev_business: raw.prev_business,
        // As on the area route: only an explicit 重飲食可 / 不可 counts, never the absence of 飲食 from
        // the NG list, which says nothing about heavy food either way.
        heavy_food_ok: parseHeavyFood(raw.excluded_business, raw.business_types),
        business_limit: limitParts.length > 0 ? limitParts.join(' / ') : null,
        // The site publishes no listing date.
        listed_at: null,
        ward: parseWard(address),
        // Town-level for a guest, down to the 番地 for a member. raw.lat / raw.lng are precise either way.
        address_hint: address,
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

    const cookie = await memberCookie();
    // A guest page and a member page of the same listing are different documents, so they cannot share a key.
    const item = (await cache.tryGet(`bukenavi:detail:${cookie === null ? 'guest' : 'member'}:${region}:${id}`, async () =>
        parseDetail(await ofetch(link, { responseType: 'text', headers: cookie === null ? undefined : { Cookie: cookie } }), region, id)
    )) as DataItem | null;
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

**With an account it also reads the 会員限定 fields.** Set \`BUKENAVI_EMAIL\` and \`BUKENAVI_PASSWORD\` and 住所 comes through to the 番地 (\`東京都新宿区歌舞伎町 2-9-10\`), plus 物件名，保証金・敷金，礼金，償却，共益費，造作譲渡金額，契約年数，座席，引渡し時期 and an explicit 居抜き / スケルトン. Both variables are optional and the route is fully usable without them — it simply stays a guest and leaves those \`null\`, which is the behaviour described below.

**Without an account the exact location is still in \`raw.lat\` / \`raw.lng\`, not in the address.** ぶけなび truncates 住所 to the 町 for guests and says so on the page — 「東京都新宿区歌舞伎町 ※詳細はお問い合わせください（住所詳細は会員限定）」 — so \`address_hint\` stops at the 町. The page's own map pin does not: \`initMap()\` is called with the listing's coordinates, and five 歌舞伎町 listings carry five different pairs spread over roughly 265m × 440m, so these are per-property positions rather than a geocode of the town. That makes them finer than the 丁目 the address withholds, and no account is needed for them. 敷金，礼金 and 造作 are absent from the guest view, and the site publishes no listing date, so those stay \`null\`.`,
    categories: ['other'],
    features: {
        requireConfig: [
            { name: 'BUKENAVI_EMAIL', optional: true, description: 'ぶけなび account e-mail. Optional — without it the route reads the public view.' },
            { name: 'BUKENAVI_PASSWORD', optional: true, description: 'ぶけなび account password. Optional — without it the route reads the public view.' },
        ],
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
