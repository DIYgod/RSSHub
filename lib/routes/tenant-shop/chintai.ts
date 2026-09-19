import { load } from 'cheerio';
import pMap from 'p-map';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseJpy, parseMonths, parseWalkMin, parseWard, parseYmd, sumKnown, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const DETAIL_CONCURRENCY = 2;
const PAGE_SIZE = 30;

/** `pa` codes of the site; East Japan is served by tenant-shop.com, 愛知 and westward by tenant-shop.jp (data is not mirrored). */
const PREFECTURES = [
    { slug: 'tokyo', code: '14', label: '東京都', host: 'https://www.tenant-shop.com' },
    { slug: 'kanagawa', code: '15', label: '神奈川県', host: 'https://www.tenant-shop.com' },
    { slug: 'saitama', code: '16', label: '埼玉県', host: 'https://www.tenant-shop.com' },
    { slug: 'chiba', code: '17', label: '千葉県', host: 'https://www.tenant-shop.com' },
    { slug: 'ibaraki', code: '18', label: '茨城県', host: 'https://www.tenant-shop.com' },
    { slug: 'tochigi', code: '19', label: '栃木県', host: 'https://www.tenant-shop.com' },
    { slug: 'gunma', code: '20', label: '群馬県', host: 'https://www.tenant-shop.com' },
    { slug: 'hokkaido', code: '7', label: '北海道', host: 'https://www.tenant-shop.com' },
    { slug: 'miyagi', code: '10', label: '宮城県', host: 'https://www.tenant-shop.com' },
    { slug: 'niigata', code: '21', label: '新潟県', host: 'https://www.tenant-shop.com' },
    { slug: 'nagano', code: '28', label: '長野県', host: 'https://www.tenant-shop.com' },
    { slug: 'aichi', code: '25', label: '愛知県', host: 'https://www.tenant-shop.jp' },
    { slug: 'gifu', code: '26', label: '岐阜県', host: 'https://www.tenant-shop.jp' },
    { slug: 'shizuoka', code: '27', label: '静岡県', host: 'https://www.tenant-shop.jp' },
    { slug: 'osaka', code: '1', label: '大阪府', host: 'https://www.tenant-shop.jp' },
    { slug: 'kyoto', code: '31', label: '京都府', host: 'https://www.tenant-shop.jp' },
    { slug: 'hyogo', code: '32', label: '兵庫県', host: 'https://www.tenant-shop.jp' },
    { slug: 'shiga', code: '5', label: '滋賀県', host: 'https://www.tenant-shop.jp' },
    { slug: 'nara', code: '34', label: '奈良県', host: 'https://www.tenant-shop.jp' },
];

/** `f{n}-1` path filters of the site. */
const TYPES = [
    { slug: 'inuki', code: 'f1', label: '居抜き' },
    { slug: 'food', code: 'f2', label: '飲食' },
    { slug: 'office', code: 'f3', label: 'オフィス' },
    { slug: 'retail', code: 'f4', label: '物販・サービス' },
    { slug: 'warehouse', code: 'f5', label: '倉庫・工場' },
    { slug: 'beauty', code: 'f6', label: '美容・エステ・医療' },
    { slug: 'roadside', code: 'f7', label: '沿道サービス・借地' },
    { slug: 'mall', code: 'f8', label: '商業施設' },
];

interface ListCard {
    title: string;
    link: string;
    image?: string;
    extra: ListingExtra;
}

interface DetailFields {
    status: string | null; // 現況 '空き'
    registered_at: string | null; // 物件登録日 '2026年9月13日'
    updated_at: string | null; // 情報更新日
    facilities: string[]; // 居抜き / 飲食 / 物販・サービス / …
    remarks: string | null; // 備考
}

/**
 * List page (`/chintai_biz/pa-14/shin-1/`, 30 per page, newest first, server-rendered): one `table.result` per card.
 *   title/link div.estatename a ('/detail/e-169996/'), 種別 div.esttype, 賃料 div.price '37.40万(税込)', 坪単価 .smallText '(坪単価:5.80万/坪)',
 *   面積 div.area_wrap '建物21.33㎡（6.45坪）', icon rows div.add img[src$="/{icon}.png"] with no text label:
 *   kanri 管理費, rei 礼金 '2ヶ月', hoken 保証金 '10ヶ月', shiki 敷金 '5ヶ月', kaiyaku 償却, addr 所在地 '文京区湯島3',
 *   station 最寄駅 '湯島駅（徒歩1分）', chikunen 築年月, floor 階 '1階／9階建'; PR div.cmnt1; NEW img.new_label
 */
const parseList = (html: string, host: string): ListCard[] => {
    const $ = load(html);
    return $('table.result')
        .toArray()
        .map((el): ListCard | null => {
            const $el = $(el);
            const a = $el.find('div.estatename a').first();
            const href = a.attr('href');
            const title = clean(a.text());
            const id = href?.match(/\/detail\/e-(\d+)/)?.[1];
            if (!href || !title || !id) {
                return null;
            }
            const iconRow = (icon: string): string | null => clean($el.find(`div.add img[src$="/${icon}.png"]`).first().parent().text());
            const raw: ListingExtra['raw'] = {
                type: clean($el.find('div.esttype').text()),
                rent: clean($el.find('div.price').text()),
                tsubo_unit: clean($el.find('div.price').next('.smallText').text()),
                area: clean($el.find('div.area_wrap').text()),
                management_fee: iconRow('kanri'),
                key_money: iconRow('rei'),
                guarantee: iconRow('hoken'),
                security: iconRow('shiki'),
                amortization: iconRow('kaiyaku'),
                address: iconRow('addr'),
                station: iconRow('station'),
                built: iconRow('chikunen'),
                floor: iconRow('floor'),
                comment: clean($el.find('div.cmnt1').text()),
            };
            const rentJpy = parseJpy(raw.rent);
            const { tsubo, area_m2 } = parseArea(raw.area);
            // '湯島駅（徒歩1分）' | '南海本線 難波駅（徒歩2分）' → optional line + station
            const stationParts = clean(raw.station?.replace(/[（(].*$/, ''))?.split(' ') ?? [];
            const station = stationParts.length > 0 ? stationParts.at(-1)!.replace(/駅$/, '') : null;
            const line = stationParts.length > 1 ? stationParts.slice(0, -1).join(' ') : null;
            // 保証金 / 敷金 are given either in months ('10ヶ月') or in yen ('145.26万円')
            const deposits = [raw.guarantee, raw.security];
            const depositMonths = deposits.every((d) => d === null) ? null : sumKnown(parseMonths(raw.guarantee), parseMonths(raw.security));
            const depositYen = deposits.filter((d): d is string => d !== null && /[万円]/.test(d));
            const image = $el.find('div.photo img').first().attr('src');

            return {
                title,
                link: new URL(href, host).href,
                image: image ? new URL(image, host).href : undefined,
                extra: {
                    source: 'tenant-shop',
                    listing_id: id,
                    rent_jpy: rentJpy,
                    tsubo,
                    area_m2,
                    tsubo_unit_jpy: parseJpy(raw.tsubo_unit) ?? tsuboUnit(rentJpy, tsubo),
                    floor: normalizeFloor(clean(raw.floor?.split('／', 1)[0])),
                    station,
                    line,
                    walk_min: parseWalkMin(raw.station),
                    deposit_months: depositMonths,
                    deposit_jpy: depositYen.length === 0 ? null : sumKnown(parseJpy(depositYen[0]), parseJpy(depositYen[1] ?? null)),
                    key_money_months: parseMonths(raw.key_money),
                    fixtures_transfer_jpy: null,
                    condition: null,
                    prev_business: null,
                    heavy_food_ok: null,
                    business_limit: null,
                    listed_at: null,
                    ward: parseWard(raw.address),
                    address_hint: raw.address,
                    tags: $el.find('img.new_label').length > 0 ? ['NEW'] : [],
                    raw,
                },
            };
        })
        .filter((c): c is ListCard => c !== null);
};

/** Detail page (`/detail/e-{id}/`): div.info-block4 table th → td (現況, 物件登録日, 情報更新日); category tags div.facility_list li a. */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const cell = (label: string): string | null => {
        const th = $('div.info-block4 th')
            .toArray()
            .find((t) => clean($(t).text()) === label);
        return th ? clean($(th).next('td').text()) : null;
    };
    return {
        status: cell('現況'),
        registered_at: cell('物件登録日'),
        updated_at: cell('情報更新日'),
        facilities: $('div.facility_list li a')
            .toArray()
            .map((t) => clean($(t).text()))
            .filter((t): t is string => t !== null),
        remarks: clean($('div.pr_cmnt3').text()),
    };
};

const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => ({
    ...base,
    // The 居抜き facility tag is set on only some listings; for the rest the PR blurb and 備考 are
    // where the site says 居抜き or スケルトン.
    condition: d.facilities.includes('居抜き') ? 'inuki' : parseCondition(base.raw.comment, d.remarks),
    listed_at: parseYmd(d.registered_at),
    tags: [...base.tags, ...d.facilities],
    raw: { ...base.raw, status: d.status, registered_at: d.registered_at, updated_at: d.updated_at, remarks: d.remarks },
});

/** A failed detail page keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link)));
    } catch (error) {
        logger.warn(`tenant-shop: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref') ?? 'tokyo';
    const prefecture = PREFECTURES.find((p) => p.slug === pref || p.code === pref);
    if (!prefecture) {
        throw new Error(`Unknown prefecture "${pref}", expected one of ${PREFECTURES.map((p) => p.slug).join(', ')}`);
    }
    const typeSlug: string | undefined = ctx.req.param('type');
    const type = typeSlug === undefined ? undefined : TYPES.find((t) => t.slug === typeSlug);
    if (typeSlug !== undefined && !type) {
        throw new Error(`Unknown type "${typeSlug}", expected one of ${TYPES.map((t) => t.slug).join(', ')}`);
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : PAGE_SIZE, PAGE_SIZE);
    // shin-1 selects 新着物件; the page is ordered by 登録日 desc.
    const listUrl = `${prefecture.host}/chintai_biz/pa-${prefecture.code}/${type ? `${type.code}-1/` : ''}shin-1/`;

    const cards = parseList(await ofetch(listUrl), prefecture.host).slice(0, limit);
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
                    description: [extra.raw.comment, summarize(extra)].filter(Boolean).join(' / '),
                    image: card.image,
                    _extra: extra,
                };
            }) as Promise<DataItem>,
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: `テナントショップ 新着物件 (${prefecture.label}${type ? ` ${type.label}` : ''})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/chintai/:pref?/:type?',
    name: '新着物件',
    url: 'www.tenant-shop.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/tenant-shop/chintai/tokyo/food',
    parameters: {
        pref: {
            description: "Prefecture slug or the site's `pa` code",
            default: 'tokyo',
            options: PREFECTURES.map((p) => ({ value: p.slug, label: `${p.label} (${p.code})` })),
        },
        type: {
            description: 'Property type filter; omit for all types',
            options: TYPES.map((t) => ({ value: t.slug, label: t.label })),
        },
    },
    description: `New listings (新着物件) on テナントショップネットワーク for one prefecture, newest first (first page, 30 listings). Each item's \`_extra\` carries the structured listing fields (賃料，坪，坪単価，階，最寄駅，保証金・敷金，礼金，物件登録日，…) parsed from the list and detail pages; unknown values are \`null\`. East Japan prefectures are served by tenant-shop.com and 愛知 and westward by tenant-shop.jp.

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
            source: ['www.tenant-shop.com/chintai_biz/pa-:pa/shin-1', 'www.tenant-shop.com/chintai_biz/pa-:pa'],
            target: '/chintai/:pa',
        },
        {
            source: ['www.tenant-shop.jp/chintai_biz/pa-:pa/shin-1', 'www.tenant-shop.jp/chintai_biz/pa-:pa'],
            target: '/chintai/:pa',
        },
    ],
};
