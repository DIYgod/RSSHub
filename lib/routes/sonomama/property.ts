import { load } from 'cheerio';
import pMap from 'p-map';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseHeavyFood, parseJpy, parseMonths, parseWalkMin, parseWard, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

const HOST = 'https://www.sonomama.net';
const DETAIL_CONCURRENCY = 2;
const PAGE_SIZE = 20;

/** `pref[]` values (JIS X 0401 codes without zero padding); any code 1–47 is passed through. */
const PREFECTURES: Record<string, string> = {
    tokyo: '13',
    kanagawa: '14',
    saitama: '11',
    chiba: '12',
    osaka: '27',
    kyoto: '26',
    hyogo: '28',
    aichi: '23',
    fukuoka: '40',
};

/** Values that mean "not published" in the site's cells. */
const isBlank = (text: string | null): boolean => text === null || /^[-−－]$/.test(text);

interface ListCard {
    title: string;
    link: string;
    image?: string;
    extra: ListingExtra;
}

interface DetailFields {
    address: string | null; // 住所
    access: string | null; // 交通手段 '(沿線) 都営大江戸線 (最寄駅) 門前仲町駅 (距離) 徒歩 7分'
    area: string | null; // 建坪数(店舗坪数) '14.97坪 （49.5平米）'
    key_money: string | null; // 礼金
    business_limit: string | null; // 業種制限
    description: string | null; // 出展タイトル / 物件説明
}

/**
 * List page (`/app/?action=public_property_list_search`, 20 per page, 登録順 desc, server-rendered):
 *   row #list_body .list_row, id + title .result4 .title a ('[ 75059 ]', title), 賃料 .item_hire '49.5万円', 面積 .item_width '19.8坪',
 *   階 .item_floor '1階', 所在地 + 駅 .item_station '東京都 江東区 ( 門前仲町駅 )', 敷金/保証金 .item_bond '賃料の10ヶ月分' | '45万円/ 0万円',
 *   造作 .item_price '0万円' | '応相談', 業態 .item_category '飲食店 レストラン' | 'スケルトン 重飲食可', NEW .result4 .title span.deco_accent
 */
const parseList = (html: string): ListCard[] => {
    const $ = load(html);
    return $('#list_body .list_row')
        .toArray()
        .map((el): ListCard | null => {
            const $el = $(el);
            const a = $el.find('.result4 .title a').last();
            const id = a.attr('href')?.match(/pid=(\d+)/)?.[1];
            const title = clean(a.text());
            if (!id || isBlank(title)) {
                return null;
            }
            // '飲食店<br>レストラン' | 'スケルトン<br>重飲食可' → [大分類, 中分類]
            const categoryParts = $el
                .find('.item_category p')
                .contents()
                .toArray()
                .filter((n) => n.type === 'text')
                .map((n) => clean($(n).text()))
                .filter((t): t is string => t !== null);
            const raw: ListingExtra['raw'] = {
                rent: clean($el.find('.item_hire').text()),
                area: clean($el.find('.item_width').text()),
                floor: clean($el.find('.item_floor').text()),
                station: clean($el.find('.item_station').text()),
                bond: clean($el.find('.item_bond').text()),
                fixtures: clean($el.find('.item_price').text()),
                category: categoryParts.join(' / ') || null,
            };
            const [address, stationPart] = (raw.station ?? '').split('(', 2);
            const station = clean(stationPart?.replaceAll(/[()]/g, ''));
            const [category, subCategory] = categoryParts;
            const isSkeleton = category === 'スケルトン';
            const rentJpy = parseJpy(raw.rent);
            const { tsubo, area_m2 } = parseArea(raw.area);
            const image = $el.find('img.list_image').attr('src');

            return {
                title: title!,
                link: `${HOST}/app/?action=public_property_detail&pid=${id}`,
                image: image ? new URL(image, HOST).href : undefined,
                extra: {
                    source: 'sonomama',
                    listing_id: id,
                    rent_jpy: rentJpy,
                    tsubo,
                    area_m2,
                    tsubo_unit_jpy: tsuboUnit(rentJpy, tsubo),
                    floor: normalizeFloor(raw.floor),
                    station: isBlank(station) ? null : station!.replace(/駅$/, ''),
                    line: null,
                    walk_min: null,
                    deposit_months: parseMonths(raw.bond),
                    deposit_jpy: /[万円]/.test(raw.bond ?? '') ? parseJpy(raw.bond) : null,
                    key_money_months: null,
                    fixtures_transfer_jpy: parseJpy(raw.fixtures),
                    condition: isSkeleton ? 'skeleton' : 'inuki',
                    prev_business: isSkeleton ? null : (subCategory ?? null),
                    heavy_food_ok: isSkeleton ? parseHeavyFood(subCategory ?? null) : null,
                    business_limit: null,
                    listed_at: null,
                    ward: parseWard(clean(address)?.replaceAll(' ', '') ?? null),
                    address_hint: clean(address)?.replaceAll(' ', '') ?? null,
                    tags: $el.find('.result4 .title span.deco_accent').length > 0 ? ['NEW'] : [],
                    raw,
                },
            };
        })
        .filter((c): c is ListCard => c !== null);
};

/** Detail page: `table.table_body th` → sibling `td`; `−` means not published. */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const cell = (label: string): string | null => {
        const th = $('table.table_body th')
            .toArray()
            .find((t) => clean($(t).text()) === label);
        const value = th ? clean($(th).next('td').text()) : null;
        return isBlank(value) ? null : value;
    };
    return {
        address: cell('住所'),
        access: cell('交通手段'),
        area: cell('建坪数(店舗坪数)'),
        key_money: cell('礼金'),
        business_limit: cell('業種制限'),
        description: clean($('div.detail_body div.shop_text p').first().text()),
    };
};

const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => {
    const { area_m2 } = parseArea(d.area);
    return {
        ...base,
        area_m2: area_m2 ?? base.area_m2,
        line: clean(d.access?.split('(最寄駅)', 1)[0]?.replace('(沿線)', '')),
        walk_min: parseWalkMin(d.access),
        key_money_months: parseMonths(d.key_money),
        business_limit: d.business_limit,
        address_hint: d.address ?? base.address_hint,
        ward: parseWard(d.address) ?? base.ward,
        raw: { ...base.raw, address: d.address, access: d.access, area_detail: d.area, key_money: d.key_money, business_limit: d.business_limit, description: d.description },
    };
};

/** A failed detail page keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link)));
    } catch (error) {
        logger.warn(`sonomama: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

export const handler = async (ctx): Promise<Data> => {
    const pref: string | undefined = ctx.req.param('pref');
    const prefCode = pref === undefined ? undefined : (PREFECTURES[pref] ?? pref);
    if (prefCode !== undefined && !/^(?:[1-9]|[1-3]\d|4[0-7])$/.test(prefCode)) {
        throw new Error(`Unknown prefecture "${pref}", expected a slug (${Object.keys(PREFECTURES).join(', ')}) or a JIS X 0401 code`);
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : PAGE_SIZE, PAGE_SIZE);
    // The prefecture filter is only honoured together with the submit-button parameters.
    const listUrl =
        prefCode === undefined
            ? `${HOST}/app/?action=public_property_list_search&view=1&page_index=0&page_num=${PAGE_SIZE}&sort_id=0&sort_type=1`
            : `${HOST}/app/?action=public_property_list_search&Btn_start.x=1&Btn_start.y=1&pref%5B%5D=${prefCode}`;

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
                    // The site does not publish listing dates; no pubDate is fabricated.
                    description: [extra.raw.description, summarize(extra)].filter(Boolean).join(' / '),
                    image: card.image,
                    _extra: extra,
                };
            }) as Promise<DataItem>,
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: `店舗そのままオークション 新着物件${pref ? ` (${pref})` : ''}`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/property/:pref?',
    name: '新着物件',
    url: 'www.sonomama.net',
    maintainers: ['pseudoyu'],
    handler,
    example: '/sonomama/property/tokyo',
    parameters: {
        pref: `Prefecture slug (${Object.keys(PREFECTURES).join(', ')}) or JIS X 0401 code; omit for nationwide`,
    },
    description: `New listings on 店舗そのままオークション，newest first (first page, 20 listings). Each item's \`_extra\` carries the structured listing fields (賃料，坪，階，最寄駅，敷金・保証金，造作価格，業態，業種制限，…) parsed from the list and detail pages; unknown values are \`null\`. The site does not publish listing dates, so items have no \`pubDate\`.

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
            source: ['www.sonomama.net/app/', 'www.sonomama.net/'],
            target: '/property',
        },
    ],
};
