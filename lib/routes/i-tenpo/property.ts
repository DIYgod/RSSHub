import { load } from 'cheerio';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseJpy, parseWalkMin, parseWard, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

const HOST = 'https://www.i-tenpo.com';
const SLUG = /^[a-z\d-]+$/;
/** 所在地 and the fee rows end with this members-only placeholder. */
const LOGIN_NOTE = '詳細はログイン後に表示';

/**
 * List page cards (`li.c-propertyList__item`, 20 per page, server-rendered):
 *   id input.js-propertyCheck@value (detail page `/t{id}`), title/link .c-propertyList__item__headline__ttl__txt a,
 *   image .c-propertyList__item__body__pic img@src, badges .c-badgeNew / …__headline__ttl__label__vr,
 *   and seven 見出し/内容 pairs (`…__table__list__ttl` → `…__table__list__body`):
 *     最寄駅 '山手線 高田馬場駅 徒歩 2 分', 賃料 '330,000 円(税抜)', 造作価格 '2,000,000円(税抜)' | '造作なし',
 *     所在地 '東京都新宿区 高田馬場 詳細はログイン後に表示', 階層 / 面積 '1階 / 33.56㎡(10.15坪)',
 *     前業態 | 現業態 'バー（BAR）' (前 when the shop has closed, 現 while it still trades),
 *     引渡状態 '閉店済/居抜き' | '確認中/スケルトン'.
 * 敷金・礼金 and the coordinates are members-only, so those fields stay null; the 丁目 lives only on the
 * detail page's title, and no detail page is fetched.
 */
const parseList = (html: string): DataItem[] => {
    const $ = load(html);
    return $('li.c-propertyList__item')
        .toArray()
        .map((el): DataItem | null => {
            const $el = $(el);
            const a = $el.find('.c-propertyList__item__headline__ttl__txt a').first();
            const href = a.attr('href');
            const title = clean(a.text());
            const id = $el.find('input.js-propertyCheck').attr('value');
            if (!href || !title || !id) {
                return null;
            }

            const labels = $el.find('.c-propertyList__item__body__table__list__ttl').toArray();
            const values = $el.find('.c-propertyList__item__body__table__list__body').toArray();
            const rows = new Map<string, string | null>();
            for (const [i, label] of labels.entries()) {
                const key = clean($(label).text());
                if (key !== null) {
                    rows.set(key, clean($(values[i]).text())?.replace(LOGIN_NOTE, '').trim() || null);
                }
            }
            const row = (...keys: string[]): string | null => keys.map((k) => rows.get(k) ?? null).find((v) => v !== null) ?? null;

            const raw: ListingExtra['raw'] = {
                station: row('最寄駅'),
                rent: row('賃料'),
                fixtures: row('造作価格'),
                address: row('所在地'),
                floor_area: row('階層 / 面積'),
                business: row('前業態', '現業態'),
                handover: row('引渡状態'),
            };

            // 最寄駅 links are 路線 then 駅 ('山手線' → '/yamanote-line/', '高田馬場駅' → '/tokyo/takadanobaba-st/').
            const stationLinks = $(values[labels.findIndex((l) => clean($(l).text()) === '最寄駅')])
                .find('a')
                .toArray()
                .map((x) => clean($(x).text()));
            const [floorText, areaText] = (raw.floor_area ?? '').split('/', 2);
            const { tsubo, area_m2 } = parseArea(clean(areaText));
            const rentJpy = parseJpy(raw.rent);
            const tags = [$el.find('.c-badgeNew').length > 0 ? 'NEW' : null, $el.find('.c-propertyList__item__headline__ttl__label__vr').length > 0 ? 'VR' : null].filter((t): t is string => t !== null);

            const extra: ListingExtra = {
                source: 'i-tenpo',
                listing_id: id,
                rent_jpy: rentJpy,
                tsubo,
                area_m2,
                tsubo_unit_jpy: tsuboUnit(rentJpy, tsubo),
                floor: normalizeFloor(clean(floorText)?.replaceAll('地下', 'B') ?? null),
                station: stationLinks[1]?.replace(/駅$/, '') ?? null,
                line: stationLinks[0] ?? null,
                walk_min: parseWalkMin(raw.station?.replaceAll(' ', '') ?? null),
                // 敷金 / 礼金 are shown only to signed-in users.
                deposit_months: null,
                deposit_jpy: null,
                key_money_months: null,
                fixtures_transfer_jpy: parseJpy(raw.fixtures),
                condition: parseCondition(raw.handover, title),
                prev_business: raw.business,
                heavy_food_ok: null,
                business_limit: null,
                // The card shows no 登録日; 'NEW' is the only recency signal.
                listed_at: null,
                ward: parseWard(raw.address),
                address_hint: raw.address?.replaceAll(' ', '') ?? null,
                tags,
                raw,
            };

            const link = new URL(href, HOST).href;
            const image = $el.find('.c-propertyList__item__body__pic img').attr('src');
            return {
                title,
                link,
                guid: link,
                description: summarize(extra),
                image: image || undefined,
                _extra: extra,
            };
        })
        .filter((item): item is DataItem => item !== null);
};

/** The h1 names the area the site actually resolved ('新宿区で…' / '東京都で…'), which is how a bad slug is caught. */
const resolvedArea = (html: string): string | null => {
    const h1 = clean(load(html)('h1').first().text());
    const name = h1?.split('で', 1)[0];
    return name !== undefined && name !== h1 ? name : null;
};

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city: string = ctx.req.param('city');
    const type: string | undefined = ctx.req.param('type');
    const slugs = Object.entries({ pref, city, type });
    for (const [name, value] of slugs) {
        if (value !== undefined && !SLUG.test(value)) {
            throw new Error(`Invalid ${name} "${value}", expected a lowercase site slug such as tokyo / shinjuku-city / bar`);
        }
    }
    const listUrl = `${HOST}/${pref}/${city}/${type === undefined ? '' : `${type}/`}`;

    const html: string = await ofetch(listUrl, { responseType: 'text' });
    // An unknown 市区町村 slug is answered with the whole prefecture at HTTP 200 rather than a 404, which would
    // look like a working ward feed. A real 市区町村 always ends in 区/市/町/村, so a 都道府県 here means it fell back.
    const area = resolvedArea(html);
    if (area === null || /[都道府県]$/.test(area)) {
        throw new Error(`Unknown city "${city}" for ${pref} — the site fell back to ${area ?? 'an unknown area'} instead of a 市区町村`);
    }

    return {
        title: `居抜き店舗.com ${area}${type === undefined ? '' : ` (${type})`}`,
        link: listUrl,
        language: 'ja',
        item: parseList(html),
    };
};

export const route: Route = {
    path: '/:pref/:city/:type?',
    name: '居抜き物件',
    url: 'www.i-tenpo.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/i-tenpo/tokyo/shinjuku-city',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: '市区町村 slug as the site spells it — `shinjuku-city`, `minato-city`, `yokohamashinaka-city`',
        },
        type: {
            description: 'Optional 業態 slug, e.g. `bar`, `izakaya`, `cafe`, `restaurant`, `other-restaurants`; omit for every 業態',
        },
    },
    description: `Listings on 居抜き店舗.com for one 市区町村 (first page, 20 listings), optionally narrowed to one 業態 — \`/i-tenpo/tokyo/shinjuku-city/bar\` is 新宿区のバー.

Each item's \`_extra\` follows the shared listing shape (賃料，坪，坪単価，階層，最寄駅，造作価格，前業態，引渡状態，…); unknown values are \`null\`. 敷金，礼金 and the coordinates are shown only to signed-in users and are therefore always \`null\`, the 丁目 appears only on the detail page so \`address_hint\` stops at the 町，and the cards carry no 登録日 so items have no \`pubDate\`.

引渡状態 combines two things — 営業状況 (\`閉店済\` / \`営業中\` / \`確認中\` / \`新築\`) and 引渡形態 (\`居抜き\` / \`スケルトン\` / \`現状渡し\`). Only the 引渡形態 half maps to \`condition\`, so \`現状渡し\` yields \`null\` rather than being forced into 居抜き or スケルトン；the whole string stays in \`raw.handover\`, which is where the 閉店済 closure signal can be read. Likewise 造作価格 \`造作なし\` / \`造作無償\` become \`0\` because they really are zero, while \`確認中\` stays \`null\` because it is unknown.

An unknown 市区町村 slug is answered by the site with the whole prefecture at HTTP 200 rather than a 404, so the route checks the area the page actually resolved and fails instead of silently serving prefecture-wide listings as if they were one ward's.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.i-tenpo.com/:pref/:city/:type'],
            target: '/:pref/:city/:type',
        },
    ],
};
