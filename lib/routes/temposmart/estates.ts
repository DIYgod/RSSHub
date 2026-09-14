import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import type { ListingExtra } from './utils';
import { bracketNotes, clean, normalizeFloor, parseArea, parseCondition, parseHeavyFood, parseJpy, parseMonths, parseMonthsSum, parseWalkMin, parseWard, parseYmd, sumKnown, summarize, tsuboUnit } from './utils';

const HOST = 'https://www.temposmart.jp';
const DETAIL_CONCURRENCY = 2;
const DEFAULT_LIMIT = 30;
const PAGE_SIZE = 50;

/** Prefectures the site lists (sitemap `/estates/pref/{JIS X 0401 code}`). */
const PREFECTURES = [
    { slug: 'tokyo', code: '13', label: '東京都' },
    { slug: 'kanagawa', code: '14', label: '神奈川県' },
    { slug: 'saitama', code: '11', label: '埼玉県' },
    { slug: 'chiba', code: '12', label: '千葉県' },
    { slug: 'osaka', code: '27', label: '大阪府' },
    { slug: 'kyoto', code: '26', label: '京都府' },
    { slug: 'hyogo', code: '28', label: '兵庫県' },
];

interface ListCard {
    title: string;
    link: string;
    extra: ListingExtra;
}

interface DetailFields {
    listed_at: string | null;
    updated_at: string | null;
    rent: string | null;
    tsubo_unit: string | null;
    fixtures: string | null;
    deposit: string | null; // 保証金
    security: string | null; // 敷金
    key_money: string | null; // 礼金
    contract_kind: string | null;
    contract_term: string | null;
    purpose: string | null; // 現況（建物詳細）
    available_purpose: string | null; // 可能用途
    note: string | null; // 備考
}

/**
 * List page card selectors (`/estates/pref/13?sort=new`):
 *   card .estateItem, id .estateItem__estateId--value, title/link .estateItem__estateTitle a,
 *   賃料 .estateItem__estatePrice--value ('330,000' | 'ご相談'), 坪単価 .estateItem__estateSubPrice--value,
 *   最寄駅 .stationInfo__name / .stationInfo__near--value / .stationInfo__route,
 *   所在地 .estateItem__estateAddress--link, 所在階 .estateItem__estateFloor, 保証金/敷金 .estateItem__estateDeposit,
 *   面積 .estateItem__estateArea, 現況 .estateItem__estatePurpose, tags .estateItem__estateProperties__tag
 */
const parseList = (html: string): ListCard[] => {
    const $ = load(html);
    return $('.estateItem')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const a = $el.find('.estateItem__estateTitle a').first();
            const href = a.attr('href');
            const title = clean(a.text());
            const id = clean($el.find('.estateItem__estateId--value').text());
            if (!href || !title || !id) {
                return null;
            }

            const raw: ListingExtra['raw'] = {
                rent: clean($el.find('.estateItem__estatePrice--value').text()),
                tsubo_unit: clean($el.find('.estateItem__estateSubPrice--value').text()),
                station: clean($el.find('.stationInfo__name').text()),
                walk: clean($el.find('.stationInfo__near--value').text()),
                line: clean($el.find('.stationInfo__route').text()),
                address: clean($el.find('.estateItem__estateAddress--link').first().text()),
                floor: clean($el.find('.estateItem__estateFloor').text()),
                deposit: clean($el.find('.estateItem__estateDeposit').text()),
                area: clean($el.find('.estateItem__estateArea').text()),
                purpose: clean($el.find('.estateItem__estatePurpose').text()),
            };
            const tags = $el
                .find('.estateItem__estateProperties__tag')
                .toArray()
                .map((t) => clean($(t).text()))
                .filter((t): t is string => t !== null);
            if ($el.find('.imageLabel--new').length > 0) {
                tags.unshift('NEW');
            }

            const notes = bracketNotes(title);
            const rentJpy = parseJpy(raw.rent);
            const { tsubo, area_m2 } = parseArea(raw.area);
            const purpose = raw.purpose;

            const extra: ListingExtra = {
                source: 'temposmart',
                listing_id: id,
                rent_jpy: rentJpy,
                tsubo,
                area_m2,
                tsubo_unit_jpy: parseJpy(raw.tsubo_unit) ?? tsuboUnit(rentJpy, tsubo),
                floor: normalizeFloor(raw.floor),
                station: raw.station?.replace(/駅$/, '') ?? null,
                line: raw.line,
                walk_min: parseWalkMin(raw.walk),
                deposit_months: parseMonthsSum(raw.deposit),
                deposit_jpy: null,
                key_money_months: null,
                fixtures_transfer_jpy: null,
                condition: parseCondition(purpose, title),
                prev_business: purpose !== null && purpose !== 'スケルトン' && purpose !== 'その他' ? purpose : null,
                heavy_food_ok: parseHeavyFood(title),
                business_limit: notes.length > 0 ? notes.join(' / ') : null,
                listed_at: null,
                ward: parseWard(raw.address),
                address_hint: raw.address,
                tags,
                raw,
            };
            return { title, link: new URL(href, HOST).href, extra };
        })
        .filter((c): c is ListCard => c !== null);
};

/**
 * Detail page selectors (`/estates/{id}`):
 *   登録日 / 最終変更日 .overview__date span, fee / contract / building tables table.estateTable th → td,
 *   可能用途 .availablePurpose__text, 備考 .estateTable__note--content
 */
const parseDetail = (html: string): DetailFields => {
    const $ = load(html);
    const cell = (label: string): string | null => {
        const th = $('table.estateTable th')
            .toArray()
            .find((el) => clean($(el).text()) === label);
        return th ? clean($(th).next('td').text()) : null;
    };
    const dates = $('.overview__date span')
        .toArray()
        .map((el) => clean($(el).text()))
        .filter((t): t is string => t !== null);
    const dateOf = (label: string): string | null => dates.find((d) => d.startsWith(label))?.replace(/^[^:：]+[:：]\s*/, '') ?? null;

    return {
        listed_at: dateOf('登録日'),
        updated_at: dateOf('最終変更日'),
        rent: cell('賃料'),
        tsubo_unit: cell('坪単価'),
        fixtures: cell('造作価格'),
        deposit: cell('保証金'),
        security: cell('敷金'),
        key_money: cell('礼金'),
        contract_kind: cell('契約種別'),
        contract_term: cell('契約期間'),
        purpose: cell('現況'),
        available_purpose: clean($('.availablePurpose__text').first().text()),
        note: clean($('.estateTable__note--content').text()),
    };
};

/** List fields + detail fields; values already known from the list are never overwritten with null. */
const mergeDetail = (base: ListingExtra, d: DetailFields): ListingExtra => {
    const depositMonths = d.deposit === null && d.security === null ? null : sumKnown(parseMonths(d.deposit), parseMonths(d.security));
    const limitParts = [base.business_limit, d.available_purpose === null ? null : `可能用途: ${d.available_purpose}`].filter((p): p is string => p !== null);

    return {
        ...base,
        rent_jpy: base.rent_jpy ?? parseJpy(d.rent),
        tsubo_unit_jpy: base.tsubo_unit_jpy ?? parseJpy(d.tsubo_unit) ?? tsuboUnit(base.rent_jpy, base.tsubo),
        deposit_months: depositMonths ?? base.deposit_months,
        key_money_months: parseMonths(d.key_money),
        fixtures_transfer_jpy: parseJpy(d.fixtures),
        condition: base.condition ?? parseCondition(d.purpose, d.note),
        heavy_food_ok: base.heavy_food_ok ?? parseHeavyFood(d.available_purpose),
        business_limit: limitParts.length > 0 ? limitParts.join(' / ') : null,
        listed_at: parseYmd(d.listed_at),
        raw: {
            ...base.raw,
            listed_at: d.listed_at,
            updated_at: d.updated_at,
            rent_detail: d.rent,
            fixtures: d.fixtures,
            deposit_detail: d.deposit,
            security: d.security,
            key_money: d.key_money,
            contract_kind: d.contract_kind,
            contract_term: d.contract_term,
            purpose_detail: d.purpose,
            available_purpose: d.available_purpose,
            note: d.note,
        },
    };
};

/** A failed detail page (e.g. delisted 404) keeps the list fields instead of breaking the feed. */
const enrich = async (card: ListCard): Promise<ListingExtra> => {
    try {
        return mergeDetail(card.extra, parseDetail(await ofetch(card.link)));
    } catch (error) {
        logger.warn(`temposmart: detail fetch failed for ${card.link}: ${String(error)}`);
        return { ...card.extra, raw: { ...card.extra.raw, detail_error: String(error) } };
    }
};

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref') ?? 'tokyo';
    const prefecture = PREFECTURES.find((p) => p.slug === pref || p.code === pref);
    if (!prefecture) {
        throw new Error(`Unknown prefecture "${pref}", expected one of ${PREFECTURES.map((p) => p.slug).join(', ')}`);
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : DEFAULT_LIMIT, PAGE_SIZE);
    const listUrl = `${HOST}/estates/pref/${prefecture.code}?sort=new`;

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
                    pubDate: extra.listed_at === null ? undefined : timezone(parseDate(extra.listed_at, 'YYYY-MM-DD'), 9),
                    description: summarize(extra),
                    _extra: extra,
                };
            }) as Promise<DataItem>,
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: `テンポスマート 新着物件 (${prefecture.label})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/estates/:pref?',
    name: '新着物件',
    url: 'www.temposmart.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/temposmart/estates/tokyo',
    parameters: {
        pref: {
            description: '都道府県 slug or JIS X 0401 code',
            default: 'tokyo',
            options: PREFECTURES.map((p) => ({ value: p.slug, label: `${p.label} (${p.code})` })),
        },
    },
    description: `New listings on テンポスマート for one prefecture, sorted by 新着順 (first page, 50 listings). Each item's \`_extra\` carries the structured listing fields (賃料，坪，坪単価，階，最寄駅，保証金，礼金，造作譲渡料，現況，業種制限，登録日，…) parsed from the list and detail pages; unknown values are \`null\`.

| Query   | Description                                                                  | Default |
| ------- | ---------------------------------------------------------------------------- | ------- |
| \`limit\` | Number of listings to process (detail pages are fetched per listing), max 50 | 30      |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.temposmart.jp/estates/pref/:pref'],
            target: '/estates/:pref',
        },
    ],
};
