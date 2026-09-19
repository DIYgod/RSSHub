import { load } from 'cheerio';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseJpy, parseWalkMin, parseWard, parseYmd, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const HOST = 'https://www.i-tenpo.com';
/** 所在地 and the fee rows end with this members-only placeholder. */
const LOGIN_NOTE = '詳細はログイン後に表示';

/**
 * One listing, from `/t{id}`.
 *
 * The page's own 所在地 field stops at the 町 exactly as the list does ('東京都新宿区高田馬場 詳細はログイン後に表示'),
 * and the 丁目 appears **only** in the document title, which reads
 * '新宿区高田馬場2丁目/高田馬場駅徒歩2分/バー（BAR）/1階/10.15坪/居抜き・貸店舗（物件No…）の物件情報【居抜き店舗.com】'.
 * The first `/`-separated segment is therefore the finest address the site publishes without a login.
 */
const parseDetail = (html: string, id: string): DataItem | null => {
    const $ = load(html);

    const rows = new Map<string, string>();
    const labels = $('[class*="__item__ttl"]').toArray();
    const values = $('[class*="__item__text"]').toArray();
    for (const [i, label] of labels.entries()) {
        const key = clean($(label).text());
        const v = clean($(values[i]).text())?.replace(LOGIN_NOTE, '').trim();
        if (key !== null && !rows.has(key)) {
            rows.set(key, v ?? '');
        }
    }
    const row = (label: string): string | null => clean(rows.get(label) ?? null);

    const title = clean($('meta[property="og:title"]').attr('content')) ?? clean($('title').text());
    if (title === null) {
        return null;
    }
    // '新宿区高田馬場2丁目/高田馬場駅徒歩2分/…' — the address is the first segment.
    const titleAddress = clean(title.split('/', 1)[0]);
    const titleWard = parseWard(titleAddress);
    const address = titleWard === null ? row('所在地') : titleAddress;

    // '更新日：2026年09月18日' sits in the page body rather than in a labelled row.
    const updated = clean(/更新日[：:]\s*(\d{4}年\d{1,2}月\d{1,2}日)/.exec($('body').text())?.[1] ?? null);

    const raw: ListingExtra['raw'] = {
        station: row('最寄駅'),
        rent: row('賃料'),
        address: row('所在地'),
        title_address: titleAddress,
        building: row('建物名'),
        fixtures: row('造作価格'),
        floor: row('階層'),
        area: row('面積'),
        business: row('前業態') ?? row('現業態'),
        handover: row('引渡状態'),
        updated_at: updated,
    };

    const rentJpy = parseJpy(raw.rent);
    const { tsubo, area_m2 } = parseArea(raw.area);
    const stationLinks = $('[class*="__item__text"] a')
        .toArray()
        .map((a) => clean($(a).text()))
        .filter((t): t is string => t !== null);

    const extra: ListingExtra = {
        source: 'i-tenpo',
        listing_id: id,
        rent_jpy: rentJpy,
        tsubo,
        area_m2,
        tsubo_unit_jpy: tsuboUnit(rentJpy, tsubo),
        floor: normalizeFloor(raw.floor?.replaceAll('地下', 'B') ?? null),
        station: stationLinks[1]?.replace(/駅$/, '') ?? null,
        line: stationLinks[0] ?? null,
        walk_min: parseWalkMin(raw.station?.replaceAll(' ', '') ?? null),
        // 敷金 / 礼金 are shown only to signed-in users, here as on the list page.
        deposit_months: null,
        deposit_jpy: null,
        key_money_months: null,
        fixtures_transfer_jpy: parseJpy(raw.fixtures),
        condition: parseCondition(raw.handover, title),
        prev_business: raw.business,
        heavy_food_ok: null,
        business_limit: null,
        // The site publishes 更新日 but no 掲載日, so this is a last-modified date, not a first-listed one.
        listed_at: parseYmd(updated),
        ward: parseWard(address),
        address_hint: address,
        tags: [],
        raw,
    };

    const link = `${HOST}/t${id}`;
    return {
        title: clean(title.split('の物件情報', 1)[0]) ?? title,
        link,
        guid: link,
        pubDate: extra.listed_at === null ? undefined : timezone(parseDate(extra.listed_at, 'YYYY-MM-DD'), 9),
        description: summarize(extra),
        _extra: extra,
    };
};

export const handler = async (ctx): Promise<Data> => {
    const id: string = ctx.req.param('id');
    if (!/^\d+$/.test(id)) {
        throw new Error(`Invalid id "${id}", expected the numeric 物件 id from a /t{id} URL`);
    }
    const link = `${HOST}/t${id}`;

    const item = (await cache.tryGet(`i-tenpo:detail:${id}`, async () => {
        const html: string = await ofetch(link, { responseType: 'text' });
        return parseDetail(html, id);
    })) as DataItem | null;

    if (item === null) {
        throw new Error(`i-tenpo: listing ${id} could not be read; it may have been delisted`);
    }

    return {
        title: `居抜き店舗.com ${item.title}`,
        link,
        language: 'ja',
        item: [item],
    };
};

export const route: Route = {
    path: '/detail/:id',
    name: '物件詳細',
    url: 'www.i-tenpo.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/i-tenpo/detail/99523',
    parameters: {
        id: {
            description: 'The numeric 物件 id, i.e. the `99523` in `https://www.i-tenpo.com/t99523`',
        },
    },
    description: `One listing on 居抜き店舗.com, for following a single property rather than a whole ward — a listing's 賃料，引渡状態 and availability all change over its life.

Its one advantage over the ward routes is the address. The page's own 所在地 field stops at the 町 exactly as the list does (\`東京都新宿区高田馬場 詳細はログイン後に表示\`), but the document title carries the 丁目 — \`新宿区高田馬場2丁目/高田馬場駅徒歩2分/…\` — so \`address_hint\` reaches the 丁目 here and only here.

\`_extra\` follows the shared listing shape. 敷金 and 礼金 are shown only to signed-in users, here as on the list page, so they stay \`null\`. The site publishes 更新日 but no 掲載日，so \`listed_at\` and \`pubDate\` are a last-modified date rather than a first-listed one — do not read them as a publication date.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.i-tenpo.com/t:id'],
            target: '/detail/:id',
        },
    ],
};
