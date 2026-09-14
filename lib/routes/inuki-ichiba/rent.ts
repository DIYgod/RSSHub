import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';

import type { ListingExtra } from './utils';
import { clean, normalizeFloor, parseArea, parseCondition, parseHeavyFood, parseJpy, parseMonths, parseWalkMin, parseWard, summarize, tsuboUnit } from './utils';

// `www.` 301s to the bare domain.
const HOST = 'https://inuki-ichiba.jp';
const DETAIL_CONCURRENCY = 2;
const PAGE_SIZE = 20;

/** 一都三県 — the only prefectures in the site's search form (`location[<code>][prefecture]`). */
const PREFECTURES = [
    { slug: 'tokyo', code: '13', label: '東京都' },
    { slug: 'kanagawa', code: '14', label: '神奈川県' },
    { slug: 'saitama', code: '11', label: '埼玉県' },
    { slug: 'chiba', code: '12', label: '千葉県' },
];

interface ListCard {
    title: string;
    link: string;
    extra: ListingExtra;
}

interface DetailFields {
    deposit: string | null; // 敷金・保証金 '160万円' | '3ヶ月'
    fixtures: string | null; // 造作代金 '無償譲渡'
    food_condition: string | null; // 飲食条件 '重飲食可'
    type: string | null; // 物件タイプ/現業態
}

/**
 * List page (`/sp_rent/1`, `/rent/search-results`) renders a PC and an SP copy; only `.property_list.pc_only` is read.
 *   card .property_box, title/link h3.title a ('浅草橋駅 | 徒歩6分 | 台東区浅草橋5丁目', href '/rent/21712'),
 *   rows .detail_box .detail → .head label + .item value:
 *     駅 a(路線) a(駅) '徒歩6分' | 賃料 '352,000円(税込)' | 造作価格 '無償譲渡' | '相談' (row absent when none)
 *     物件タイプ/現業態 '居抜き / 居酒屋' | 'スケルトン' | エリア a(区/市) a(町) | 階数/面積 '1F / 16.55坪 (54.74㎡)'
 *   tags .tag_list li (NEW, 値下げ), .picto_list .picto (路面店)
 */
const parseList = (html: string): ListCard[] => {
    const $ = load(html);
    return $('.property_list.pc_only .property_box')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const a = $el.find('h3.title a').first();
            const href = a.attr('href');
            const title = clean(a.text());
            const id = href?.match(/\/rent\/(\d+)/)?.[1];
            if (!href || !title || !id) {
                return null;
            }

            const rows = new Map<string, ReturnType<typeof $>>();
            for (const row of $el.find('.detail_box .detail').toArray()) {
                const head = clean($(row).find('.head').first().text());
                if (head) {
                    rows.set(head, $(row).find('.item').first());
                }
            }
            const text = (label: string): string | null => clean(rows.get(label)?.text());
            const links = (label: string): string[] => (rows.get(label)?.find('a').toArray() ?? []).map((x) => clean($(x).text())).filter((x): x is string => x !== null);

            const [line, station] = links('駅');
            const [ward, town] = links('エリア');
            const [floorText, areaText] = (text('階数/面積') ?? '').split(/\s*\/\s*/, 2);
            const typeText = text('物件タイプ/現業態');
            const [typeKind, typeBusiness] = (typeText ?? '').split(/\s*\/\s*/, 2);

            const raw: ListingExtra['raw'] = {
                station: text('駅'),
                rent: text('賃料'),
                fixtures: text('造作価格'),
                type: typeText,
                area_row: text('エリア'),
                floor_area: text('階数/面積'),
            };
            const tags = [...$el.find('.tag_list li').toArray(), ...$el.find('.picto_list .picto').toArray()].map((t) => clean($(t).text())).filter((t): t is string => t !== null);

            const rentJpy = parseJpy(raw.rent);
            const { tsubo, area_m2 } = parseArea(clean(areaText));

            const extra: ListingExtra = {
                source: 'inuki-ichiba',
                listing_id: id,
                rent_jpy: rentJpy,
                tsubo,
                area_m2,
                tsubo_unit_jpy: tsuboUnit(rentJpy, tsubo),
                floor: normalizeFloor(clean(floorText)),
                station: station?.replace(/駅$/, '') ?? null,
                line: line ?? null,
                walk_min: parseWalkMin(raw.station),
                deposit_months: null,
                deposit_jpy: null,
                key_money_months: null,
                fixtures_transfer_jpy: parseJpy(raw.fixtures),
                condition: parseCondition(typeKind ?? null),
                prev_business: clean(typeBusiness),
                heavy_food_ok: null,
                business_limit: null,
                listed_at: null,
                ward: ward ?? parseWard(title.split('|').pop()?.trim() ?? null),
                address_hint: ward && town ? `${ward}${town}` : (ward ?? null),
                tags,
                raw,
            };
            return { title, link: new URL(href, HOST).href, extra };
        })
        .filter((c): c is ListCard => c !== null);
};

/** Detail page (non-member view): `.detail .head` label → sibling `.item`. 物件概要 and the map are members-only. */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const item = (label: string): string | null => {
        const head = $('.detail .head')
            .toArray()
            .find((el) => clean($(el).text()) === label);
        return head ? clean($(head).siblings('.item').first().text()) : null;
    };
    return {
        deposit: item('敷金・保証金'),
        fixtures: item('造作代金'),
        food_condition: item('飲食条件'),
        type: item('物件タイプ/現業態'),
    };
};

/** 敷金・保証金 is either an amount ('160万円') or months ('3ヶ月'); they land in deposit_jpy / deposit_months respectively. */
const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => ({
    ...base,
    deposit_months: parseMonths(d.deposit),
    deposit_jpy: parseJpy(d.deposit),
    fixtures_transfer_jpy: base.fixtures_transfer_jpy ?? parseJpy(d.fixtures),
    heavy_food_ok: parseHeavyFood(d.food_condition),
    business_limit: d.food_condition,
    raw: {
        ...base.raw,
        deposit: d.deposit,
        fixtures_detail: d.fixtures,
        food_condition: d.food_condition,
        type_detail: d.type,
    },
});

/** A failed detail page (e.g. delisted 404) keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link)));
    } catch (error) {
        logger.warn(`inuki-ichiba: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

export const handler = async (ctx): Promise<Data> => {
    const pref: string | undefined = ctx.req.param('pref');
    const prefecture = pref === undefined ? undefined : PREFECTURES.find((p) => p.slug === pref || p.code === pref);
    if (pref !== undefined && !prefecture) {
        throw new Error(`Unknown prefecture "${pref}", expected one of ${PREFECTURES.map((p) => p.slug).join(', ')}`);
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : PAGE_SIZE, PAGE_SIZE);
    // `sort=id` is the 新着順 option of the search results page.
    const listUrl = prefecture ? `${HOST}/rent/search-results?location%5B${prefecture.code}%5D%5Bprefecture%5D=${prefecture.code}&sort=id` : `${HOST}/sp_rent/1`;

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
                    // The site does not publish a listing date; no pubDate is fabricated.
                    description: summarize(extra),
                    _extra: extra,
                };
            }) as Promise<DataItem>,
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: `居抜き市場 新着物件${prefecture ? ` (${prefecture.label})` : ''}`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/rent/:pref?',
    name: '新着物件',
    url: 'inuki-ichiba.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/inuki-ichiba/rent/tokyo',
    parameters: {
        pref: {
            description: '都道府県 slug or JIS X 0401 code; omit for the site-wide 新着物件 page (一都三県 mixed)',
            options: PREFECTURES.map((p) => ({ value: p.slug, label: `${p.label} (${p.code})` })),
        },
    },
    description: `New listings on 居抜き市場，20 per page (first page only). With a prefecture the search results are sorted by 新着順；without one the site's 新着物件 page is used. Each item's \`_extra\` carries the structured listing fields (賃料，坪，階，最寄駅，敷金・保証金，造作価格，物件タイプ，現業態，飲食条件，…) parsed from the list and detail pages; unknown values are \`null\`. The site does not publish listing dates, so items have no \`pubDate\`.

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
            source: ['inuki-ichiba.jp/sp_rent/1', 'inuki-ichiba.jp/'],
            target: '/rent',
        },
    ],
};
