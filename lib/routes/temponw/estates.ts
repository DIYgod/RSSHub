import { load } from 'cheerio';
import pMap from 'p-map';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseHeavyFood, parseJpy, parseMonths, parseWalkMin, parseWard, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

const HOST = 'https://www.temponw.com';
const DETAIL_CONCURRENCY = 2;
const PAGES = 2; // 10 cards per page

/** Tokyo 23 wards as the site's `cities[]` codes (101 千代田区 … 123 江戸川区). */
const TOKYO_WARDS = Array.from({ length: 23 }, (_, i) => String(101 + i));

const isBlank = (text: string | null): boolean => text === null || /^[-−－]$/.test(text);

interface ListCard {
    title: string;
    link: string;
    image?: string;
    extra: ListingExtra;
}

interface DetailFields {
    access: string | null; // 最寄駅 'ＪＲ総武線 新小岩 徒歩3分'
    fixtures: string | null; // 造作譲渡料 '造作無償' | '-'
    status: string | null; // 現況 '空'
    contract: string | null; // 契約形態 '普通借家'
    term: string | null; // 契約期間 '3年'
    notes: string[]; // 備考 '不可業態： 重飲食不可／24時間営業不可'
}

/**
 * List page (10 cards, each rendered twice — only the PC copy `.result-contents.sm-hidden` is read):
 *   title .result-content-title span, id/link hidden inputs source_system_code + item_no,
 *   rows .result-detail-row > div(label) + div(value): 賃料 '月額 22.5万円 税別', 面積 '57.91 m2（17.52 坪）',
 *   使用階/部屋番号 '2/202' | 'B1/Ｂ００１', 最寄駅 'ＪＲ総武線 新小岩', 所在地 '東京都葛飾区新小岩１丁目41番地12号',
 *   保証金/礼金 (two <p>: '3.00ヶ月', '2.00ヶ月' | '110万円'), 管理費等; PR .point-content; image .result-content-img img
 */
const parseList = (html: string): ListCard[] => {
    const $ = load(html);
    return $('.result-contents.sm-hidden')
        .toArray()
        .map((el): ListCard | null => {
            const $el = $(el);
            const source = $el.find('input[name="source_system_code"]').first().attr('value');
            const itemNo = $el.find('input[name="item_no"]').first().attr('value');
            const title = clean($el.find('.result-content-title span').text());
            if (!source || !itemNo || !title) {
                return null;
            }
            const row = (label: string) =>
                $el
                    .find('.result-detail-row')
                    .toArray()
                    .map((r) => $(r).children())
                    .find((children) => clean(children.first().text()) === label)
                    ?.last();
            const value = (label: string): string | null => {
                const v = clean(row(label)?.text());
                return isBlank(v) ? null : v;
            };
            const deposits =
                row('保証金/礼金')
                    ?.find('p')
                    .toArray()
                    .map((p) => clean($(p).text())) ?? [];

            const raw: ListingExtra['raw'] = {
                rent: value('賃料'),
                area: value('面積'),
                floor_room: value('使用階/部屋番号'),
                station: value('最寄駅'),
                address: value('所在地'),
                guarantee: isBlank(deposits[0] ?? null) ? null : deposits[0],
                key_money: isBlank(deposits[1] ?? null) ? null : deposits[1],
                management_fee: value('管理費等'),
                comment: clean($el.find('.point-content').text()),
            };
            const [line, station] = (raw.station?.normalize('NFKC') ?? '').split(' ', 2);
            const rentJpy = parseJpy(raw.rent);
            const { tsubo, area_m2 } = parseArea(raw.area);
            const image = $el.find('.result-content-img img').first().attr('src');

            return {
                title,
                link: `${HOST}/store_detail?source_system_code=${source}&item_no=${itemNo}`,
                image: image ? new URL(image, HOST).href : undefined,
                extra: {
                    source: 'temponw',
                    listing_id: `${source}-${itemNo}`,
                    rent_jpy: rentJpy,
                    tsubo,
                    area_m2,
                    tsubo_unit_jpy: tsuboUnit(rentJpy, tsubo),
                    floor: normalizeFloor(clean(raw.floor_room?.split('/', 1)[0])),
                    station: clean(station?.replace(/、他.*$/, ''))?.replace(/駅$/, '') ?? null,
                    line: clean(line),
                    walk_min: null,
                    deposit_months: parseMonths(raw.guarantee),
                    deposit_jpy: /[万円]/.test(raw.guarantee ?? '') ? parseJpy(raw.guarantee) : null,
                    key_money_months: parseMonths(raw.key_money),
                    fixtures_transfer_jpy: null,
                    condition: null,
                    prev_business: null,
                    heavy_food_ok: null,
                    business_limit: null,
                    listed_at: null,
                    ward: parseWard(raw.address?.normalize('NFKC') ?? null),
                    address_hint: raw.address,
                    tags: [],
                    raw,
                },
            };
        })
        .filter((c): c is ListCard => c !== null);
};

/** Detail page: `.content-detail .container-div.inline-container` → span:first p (label), span:last p (value). */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const field = (label: string): string | null => {
        const box = $('.content-detail .container-div.inline-container')
            .toArray()
            .find((b) => clean($(b).find('span').first().find('p').text()) === label);
        const v = box ? clean($(box).find('span').last().find('p').text()) : null;
        return isBlank(v) ? null : v;
    };
    return {
        access: clean($('.detail-access .detail-access-info').first().text()),
        fixtures: field('造作譲渡料'),
        status: field('現況'),
        contract: field('契約形態'),
        term: field('契約期間'),
        notes: $('.detail-note li')
            .toArray()
            .map((li) => clean($(li).text()))
            .filter((t): t is string => t !== null),
    };
};

const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => {
    const restriction = clean(d.notes.find((n) => n.includes('不可業態'))?.replace(/^不可業態[:：]\s*/, ''));
    return {
        ...base,
        walk_min: parseWalkMin(d.access),
        fixtures_transfer_jpy: parseJpy(d.fixtures),
        // 現況 is a real field but is published as '-' throughout, so the PR blurb is the only place
        // this site says 居抜き or スケルトン at all.
        condition: parseCondition(d.status, base.raw.comment),
        heavy_food_ok: parseHeavyFood(restriction),
        business_limit: restriction === null ? null : `不可: ${restriction}`,
        raw: { ...base.raw, access: d.access, fixtures: d.fixtures, status: d.status, contract: d.contract, term: d.term, notes: d.notes.join(' / ') || null },
    };
};

/** A failed detail page keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link)));
    } catch (error) {
        logger.warn(`temponw: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

const listUrlFor = (area: string | undefined, page: number): string => {
    if (area === undefined) {
        return `${HOST}/result?sort=new&page=${page}`;
    }
    // The site requires `cities[]`; all 23 wards are passed at once for Tokyo.
    const query = new URLSearchParams({ prefectures_code: '13', name_j: '東京都' });
    for (const code of TOKYO_WARDS) {
        query.append('cities[]', code);
    }
    query.set('sort', 'new');
    query.set('page', String(page));
    return `${HOST}/area_search/result?${query.toString()}`;
};

export const handler = async (ctx): Promise<Data> => {
    const area: string | undefined = ctx.req.param('area');
    if (area !== undefined && area !== 'tokyo') {
        throw new Error(`Unknown area "${area}", expected "tokyo" or none`);
    }
    const pages = await Promise.all(Array.from({ length: PAGES }, (_, i) => ofetch(listUrlFor(area, i + 1))));
    const seen = new Set<string>();
    const cards = pages.flatMap((html) => parseList(html)).filter((card) => (seen.has(card.link) ? false : seen.add(card.link)));

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
                    description: [extra.raw.comment, summarize(extra)].filter(Boolean).join(' / '),
                    image: card.image,
                    _extra: extra,
                };
            }) as Promise<DataItem>,
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: `店舗ネットワーク 新着物件${area === 'tokyo' ? ' (東京23区)' : ''}`,
        link: listUrlFor(area, 1),
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/estates/:area?',
    name: '新着物件',
    url: 'www.temponw.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/temponw/estates/tokyo',
    parameters: {
        area: {
            description: '`tokyo` for the 23 wards of Tokyo; omit for nationwide',
            options: [{ value: 'tokyo', label: '東京23区' }],
        },
    },
    description: `Listings on 店舗ネットワーク sorted by 新着順 (first two pages, 20 listings). Each item's \`_extra\` carries the structured listing fields (賃料，坪，階，最寄駅，保証金，礼金，造作譲渡料，不可業態，…) parsed from the list and detail pages; unknown values are \`null\`. The site does not publish listing dates, so items have no \`pubDate\`; the same unit may be listed by several agencies under different ids.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.temponw.com/result', 'www.temponw.com/'],
            target: '/estates',
        },
    ],
};
