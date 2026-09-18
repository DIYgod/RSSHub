import { load } from 'cheerio';
import pMap from 'p-map';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseJpy, parseMonths, parseMonthsSum, parseWalkMin, parseWard, parseYmd, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const HOST = 'https://canaeru.usen.com';
const DETAIL_CONCURRENCY = 2;
const DEFAULT_LIMIT = 10;
const PAGE_SIZE = 10;

/**
 * The site splits its stock across regional base paths; 関西 is not reachable under any of them
 * (`/bukken_k/osaka`, `/bukken_o/osaka` and `/bukken/osaka` all 404), so it is not offered.
 */
const PREFECTURES = [
    { slug: 'tokyo', base: 'bukken', label: '東京都', code: '13' },
    { slug: 'kanagawa', base: 'bukken', label: '神奈川県', code: '14' },
    { slug: 'saitama', base: 'bukken', label: '埼玉県', code: '11' },
    { slug: 'chiba', base: 'bukken', label: '千葉県', code: '12' },
    { slug: 'hokkaido', base: 'bukken_h', label: '北海道', code: '01' },
    { slug: 'aichi', base: 'bukken_tokai', label: '愛知県', code: '23' },
    { slug: 'shizuoka', base: 'bukken_tokai', label: '静岡県', code: '22' },
];

interface ListCard {
    title: string;
    link: string;
    image?: string;
    extra: ListingExtra;
}

interface DetailFields {
    listed_at: string | null;
    updated_at: string | null;
    fixtures: string | null; // 造作価格
    key_money: string | null; // 礼金
    deposit: string | null; // 保証金
    contract_kind: string | null;
    purpose: string | null; // 可能用途
    lat: string | null;
    lng: string | null;
}

/** The site prints 「ー」 (and plain dashes) for "not stated"; those must not survive as a value. */
const value = (text: string | null): string | null => {
    const s = clean(text);
    return s === null || /^[ー—–－-]+$/.test(s) ? null : s;
};

/** 'JR山手線新宿駅' → ['JR山手線', '新宿']; a station with no 線 prefix yields a null line. */
const splitStation = (text: string | null): { line: string | null; station: string | null } => {
    const s = clean(text?.split('徒歩', 1)[0] ?? null);
    if (s === null) {
        return { line: null, station: null };
    }
    // Split at the last 線 rather than with a regex, which would backtrack on a line name containing 線 twice.
    const cut = s.lastIndexOf('線');
    const station = (cut === -1 ? s : s.slice(cut + 1)).replace(/駅$/, '');
    return { line: cut === -1 ? null : s.slice(0, cut + 1), station: station || null };
};

/**
 * List cards (`div.result_item`, 10 per page):
 *   title + id `.title label` ('【…】物販・サービス優先店舗物件 (220168)'), detail link `.btn.detail a@href`
 *   ('/bukken/p220168/'), image `.imgLiquid img@src` ('/img/noimage.png' when absent), and a th/td table:
 *   住所 '東京都新宿区新宿三丁目23-12' (down to 番地), 最寄駅 'JR山手線新宿駅<br>徒歩2分', 現況, 賃料 ('ご相談'),
 *   保証金・敷金, 坪面積/階数 '18.53坪/地下2階'. `div.feature li` lists every flag; the ones without
 *   `class="off"` are the ones this listing actually has (NEW / 居抜き / スケルトン / 飲食可 / 駅近 / …).
 */
const parseList = (html: string): ListCard[] => {
    const $ = load(html);
    return $('div.result_item')
        .toArray()
        .map((el): ListCard | null => {
            const $el = $(el);
            const heading = clean($el.find('.title label').first().text());
            const href = $el.find('.btn.detail a').attr('href');
            const id = href?.match(/\/p(\d+)/)?.[1] ?? heading?.match(/\((\d+)\)\s*$/)?.[1];
            if (!heading || !href || !id) {
                return null;
            }
            const title = heading.replace(/\s*\(\d+\)\s*$/, '');

            const th = (label: string) =>
                $el
                    .find('th')
                    .toArray()
                    .find((t) => clean($(t).text()) === label);
            const cell = (label: string): string | null => {
                const el = th(label);
                return el ? value($(el).next('td').text()) : null;
            };
            // `<br>` separates 駅 from 徒歩, and cheerio's .text() would run them together.
            const stationEl = th('最寄駅');
            const stationHtml = stationEl ? $(stationEl).next('td').html() : null;
            const stationText = value(stationHtml?.replaceAll(/<br\s*\/?>/gi, ' ').replaceAll(/<[^>]+>/g, '') ?? null);

            const raw: ListingExtra['raw'] = {
                address: cell('住所'),
                station: stationText,
                purpose: cell('現況'),
                rent: cell('賃料'),
                deposit: cell('保証金・敷金'),
                size: cell('坪面積/階数'),
            };
            const tags = $el
                .find('div.feature li')
                .toArray()
                .filter((li) => !($(li).attr('class') ?? '').split(/\s+/).includes('off'))
                .map((li) => clean($(li).text()))
                .filter((t): t is string => t !== null);

            const [tsuboText, floorText] = (raw.size ?? '').split('/', 2);
            const { tsubo, area_m2 } = parseArea(clean(tsuboText));
            const rentJpy = parseJpy(raw.rent);
            const { line, station } = splitStation(raw.station);
            const image = $el.find('.imgLiquid img').attr('src');

            const extra: ListingExtra = {
                source: 'canaeru',
                listing_id: id,
                rent_jpy: rentJpy,
                tsubo,
                area_m2,
                tsubo_unit_jpy: tsuboUnit(rentJpy, tsubo),
                floor: normalizeFloor(clean(floorText)?.replaceAll('地下', 'B') ?? null),
                station,
                line,
                walk_min: parseWalkMin(raw.station),
                deposit_months: parseMonthsSum(raw.deposit),
                deposit_jpy: null,
                key_money_months: null,
                fixtures_transfer_jpy: null,
                // The 居抜き / スケルトン flags are the site's own classification, so they beat guessing from prose.
                condition: parseCondition(tags.join(' '), title),
                prev_business: raw.purpose,
                heavy_food_ok: null,
                business_limit: null,
                listed_at: null,
                ward: parseWard(raw.address),
                address_hint: raw.address,
                tags,
                raw,
            };
            return {
                title,
                link: new URL(href, HOST).href,
                image: image && !image.includes('noimage') ? new URL(image, HOST).href : undefined,
                extra,
            };
        })
        .filter((c): c is ListCard => c !== null);
};

/** Detail page (`/bukken/p{id}/`): `p.date` holds both dates, a th/td table holds the fees, and the map coordinates are hidden inputs. */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const cell = (label: string): string | null => {
        const el = $('th')
            .toArray()
            .find((t) => clean($(t).text()) === label);
        return el ? value($(el).next('td').text()) : null;
    };
    const dates = $('p.date').first().text();
    const dateOf = (label: string): string | null => value(new RegExp(`${label}[：:]\\s*(\\d{4}年\\d{1,2}月\\d{1,2}日)`).exec(dates)?.[1] ?? null);

    return {
        listed_at: dateOf('情報公開日'),
        updated_at: dateOf('情報更新日'),
        fixtures: cell('造作価格'),
        key_money: cell('礼金'),
        // The list writes this label with ・ and the detail page with /; parseMonthsSum adds up '6ヶ月 / 0ヶ月'.
        deposit: cell('保証金/敷金'),
        contract_kind: cell('契約種別'),
        purpose: cell('可能用途'),
        lat: value($('#lat').attr('value') ?? null),
        lng: value($('#lng').attr('value') ?? null),
    };
};

/** List fields + detail fields; a value already known from the list is never overwritten with null. */
const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => ({
    ...base,
    deposit_months: parseMonthsSum(d.deposit) ?? base.deposit_months,
    key_money_months: parseMonths(d.key_money),
    fixtures_transfer_jpy: parseJpy(d.fixtures),
    business_limit: d.purpose,
    listed_at: parseYmd(d.listed_at),
    // ListingExtra has no coordinate fields, so the pair stays in `raw` exactly as published.
    raw: {
        ...base.raw,
        listed_at: d.listed_at,
        updated_at: d.updated_at,
        fixtures: d.fixtures,
        key_money: d.key_money,
        deposit_detail: d.deposit,
        contract_kind: d.contract_kind,
        available_purpose: d.purpose,
        lat: d.lat,
        lng: d.lng,
    },
});

/** A failed detail page keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link, { responseType: 'text' })));
    } catch (error) {
        logger.warn(`canaeru: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref') ?? 'tokyo';
    const prefecture = PREFECTURES.find((p) => p.slug === pref);
    if (!prefecture) {
        throw new Error(`Unknown prefecture "${pref}", expected one of ${PREFECTURES.map((p) => p.slug).join(', ')}`);
    }
    // 市区町村 codes are the prefecture's two digits plus three more (新宿区 = 13104), written with an `A`
    // prefix in the path. A code from another prefecture would quietly widen the search, so the pair is checked.
    const city: string | undefined = ctx.req.param('city');
    if (city !== undefined) {
        if (!/^\d{5}$/.test(city)) {
            throw new Error(`Invalid city "${city}", expected a 5-digit JIS X 0402 市区町村 code such as 13104`);
        }
        if (!city.startsWith(prefecture.code)) {
            throw new Error(`City "${city}" does not belong to ${prefecture.label} (${prefecture.code})`);
        }
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : DEFAULT_LIMIT, PAGE_SIZE);
    const listUrl = `${HOST}/${prefecture.base}/${prefecture.slug}/search/${city === undefined ? '' : `A${city}/`}`;

    const cards = parseList(await ofetch(listUrl, { responseType: 'text' })).slice(0, limit);
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
        title: `canaeru 居抜き・貸店舗物件 (${prefecture.label}${city === undefined ? '' : ` ${city}`})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/:pref?/:city?',
    name: '居抜き・貸店舗物件',
    url: 'canaeru.usen.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/canaeru/tokyo/13104',
    parameters: {
        pref: {
            description: 'Prefecture',
            default: 'tokyo',
            options: PREFECTURES.map((p) => ({ value: p.slug, label: p.label })),
        },
        city: {
            description: 'Optional 市区町村, as a 5-digit JIS X 0402 code (新宿区 `13104`, 港区 `13103`, 横浜市中区 `14104`). Must belong to `pref`; omit for the whole prefecture.',
        },
    },
    description: `Listings on canaeru（USEN）for one prefecture — or one 市区町村 when \`city\` is given (\`/canaeru/tokyo/13104\` is 新宿区). Each item's \`_extra\` carries the shared listing fields (賃料，坪，坪単価，階，最寄駅，保証金，礼金，造作価格，現況，…) from the list and detail pages; unknown values are \`null\`, and the site's 「ー」 placeholder is treated as unknown rather than kept as text.

Two things this source does better than most: 住所 is published down to the 番地 rather than the 町，and the detail page carries map coordinates. \`ListingExtra\` has no coordinate fields, so they are passed through verbatim as \`raw.lat\` / \`raw.lng\`.

\`tags\` are the site's own feature flags, keeping only those a listing actually has — the markup lists every flag and greys the rest out with \`class="off"\` — and 居抜き / スケルトン among them is what sets \`condition\`.

One caveat on 造作価格: the publisher occasionally appends 万円 to a figure that is already in 円 (one listing reads \`6,050,000万円\`), so \`fixtures_transfer_jpy\` can carry an implausible value. The route parses what is published rather than second-guessing it, so treat \`raw.fixtures\` as the ground truth when the number looks wrong.

関西 is not offered: the site serves it from a separate base path that could not be reached (\`/bukken/osaka\`, \`/bukken_k/osaka\` and \`/bukken_o/osaka\` all 404).

| Query   | Description                                                                  | Default |
| ------- | ---------------------------------------------------------------------------- | ------- |
| \`limit\` | Number of listings to process (detail pages are fetched per listing), max 10 | 10      |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['canaeru.usen.com/bukken/:pref/search/:city', 'canaeru.usen.com/bukken/:pref/search'],
            target: '/:pref',
        },
    ],
};
