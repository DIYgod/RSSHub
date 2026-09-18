import { load } from 'cheerio';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseJpy, parseWalkMin, parseWard, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const HOST = 'https://www.abc-tenpo.com';

/**
 * One listing, from `/property/view/{id}`.
 *
 * The visible 所在地 field is truncated and marked 会員限定, but the document title carries the address in
 * full — '東京都文京区湯島2-31-17・都営大江戸線 本郷三丁目駅・中華料理店｜…' — so this is the one place the
 * site publishes the 丁目 **and the 番地** to a guest. The first `・`-separated segment is that address.
 */
const parseDetail = (html: string, id: string): DataItem | null => {
    const $ = load(html);

    const rows = new Map<string, string>();
    for (const el of $('th, dt').toArray()) {
        const key = clean($(el).text());
        const value = clean($(el).next('td, dd').text());
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

    const ogTitle = clean($('meta[property="og:title"]').attr('content')) ?? clean($('title').text());
    if (ogTitle === null) {
        return null;
    }
    // '東京都文京区湯島2-31-17・都営大江戸線 本郷三丁目駅・中華料理店｜…' — the address is the first segment.
    const titleAddress = clean(ogTitle.split('・', 1)[0]);
    const address = parseWard(titleAddress) === null ? row('所在地', '住所') : titleAddress;

    const raw: ListingExtra['raw'] = {
        title_address: titleAddress,
        address: row('所在地', '住所'),
        rent: row('賃料'),
        station: row('最寄駅', '最寄り駅', '交通'),
        size: row('面積'),
        floor: row('階数', '階層'),
        // '現況' is not used as a fallback: on this page that label also heads a tag-cloud block.
        prev_business: row('前業態'),
        handover: row('引渡し', '引渡状態', '現状'),
        notes: row('備考', '特記事項'),
    };

    const rentJpy = parseJpy(raw.rent);
    const { tsubo, area_m2 } = parseArea(raw.size);

    const extra: ListingExtra = {
        source: 'abc-tenpo',
        listing_id: id,
        rent_jpy: rentJpy,
        tsubo,
        area_m2,
        tsubo_unit_jpy: tsuboUnit(rentJpy, tsubo),
        floor: normalizeFloor(raw.floor?.replaceAll('地下', 'B') ?? null),
        // '都営大江戸線 本郷三丁目駅 徒歩5分' — the 駅-suffixed token is the station, the first one the line.
        station: clean(raw.station?.split(/\s+/).find((t) => t.endsWith('駅')) ?? null)?.replace(/駅$/, '') ?? null,
        line: clean(raw.station?.split(/\s+/, 1)[0] ?? null),
        walk_min: parseWalkMin(raw.station),
        // 保証金, 礼金 and 造作譲渡料 are members-only on this site.
        deposit_months: null,
        deposit_jpy: null,
        key_money_months: null,
        fixtures_transfer_jpy: null,
        condition: parseCondition(raw.handover, ogTitle),
        prev_business: raw.prev_business,
        heavy_food_ok: null,
        business_limit: null,
        // The site publishes no listing date on the detail page.
        listed_at: null,
        ward: parseWard(address),
        address_hint: address,
        tags: [],
        raw,
    };

    const link = `${HOST}/property/view/${id}`;
    return {
        title: clean(ogTitle.split('｜', 1)[0]) ?? ogTitle,
        link,
        guid: link,
        description: [raw.notes, summarize(extra)].filter(Boolean).join(' / '),
        _extra: extra,
    };
};

export const handler = async (ctx): Promise<Data> => {
    const id: string = ctx.req.param('id');
    if (!/^\d+$/.test(id)) {
        throw new Error(`Invalid id "${id}", expected the numeric 物件 id from a /property/view/{id} URL`);
    }
    const link = `${HOST}/property/view/${id}`;

    const item = (await cache.tryGet(`abc-tenpo:detail:${id}`, async () => parseDetail(await ofetch(link, { responseType: 'text' }), id))) as DataItem | null;
    if (item === null) {
        throw new Error(`abc-tenpo: listing ${id} could not be read; it may have been delisted`);
    }

    return {
        title: `ABC 店舗 ${item.title}`,
        link,
        language: 'ja',
        item: [item],
    };
};

export const route: Route = {
    path: '/detail/:id',
    name: '物件詳細',
    url: 'www.abc-tenpo.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/abc-tenpo/detail/62829',
    parameters: {
        id: {
            description: 'The numeric 物件 id, i.e. the `62829` in `https://www.abc-tenpo.com/property/view/62829`',
        },
    },
    description: `One listing on ABC 店舗，for following a single property rather than a whole prefecture.

Its reason to exist is the address. The listing route can only reach the ward (\`東京都文京区\`) because the visible 所在地 field is truncated and marked 会員限定 — but the document title carries the address in full, \`東京都文京区湯島2-31-17・…\`, so \`address_hint\` here reaches the 丁目 **and the 番地**. That makes this one of the few sources that publishes a 番地 to a guest at all.

\`_extra\` follows the shared listing shape. 保証金，礼金 and 造作譲渡料 are members-only on this site and stay \`null\`, and the detail page publishes no listing date, so \`listed_at\` is \`null\` too.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.abc-tenpo.com/property/view/:id'],
            target: '/detail/:id',
        },
    ],
};
