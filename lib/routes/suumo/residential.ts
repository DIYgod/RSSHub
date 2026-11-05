/**
 * Shared shape and text → structure helpers for Japanese residential listings (賃貸 and 売買),
 * used by the suumo, homes and athome residential routes. Unknown values are `null`, never `0`;
 * site text is kept verbatim in `raw`, keyed by the stable names `labelKey` returns.
 */
import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import { clean, normalizeFloor, parseArea, parseMonths, parseWard, parseYmd } from '@/routes/temposmart/utils';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export type DealKind = 'rent' | 'sale';
export type PropertyKind = 'mansion' | 'apartment' | 'house' | 'land';

export interface ResidentialExtra {
    source: string; // site id: 'suumo' / 'homes' / 'athome'
    listing_id: string;
    deal_kind: DealKind;
    property_type: string | null; // the site's 種目 label verbatim
    property_kind: PropertyKind | null; // read from that label only
    building_name: string | null;
    room_no: string | null; // 部屋番号, only where the site prints one
    price_jpy: number | null; // rent: 賃料（円/月）; sale: 価格（円）
    management_fee_jpy: number | null; // 管理費・共益費（円/月）
    repair_reserve_jpy: number | null; // 修繕積立金（円/月）
    deposit_months: number | null; // 敷金, when quoted in months
    deposit_jpy: number | null; // 敷金, when quoted in yen
    key_money_months: number | null; // 礼金, when quoted in months
    key_money_jpy: number | null; // 礼金, when quoted in yen
    layout: string | null; // 間取り: 2LDK / 1R
    area_m2: number | null; // 専有面積 (houses: 建物面積)
    land_area_m2: number | null; // 土地面積
    floor: string | null; // 所在階: 11F / B1F
    floors_total: number | null; // 地上階数
    built_ym: string | null; // 築年月 YYYY-MM
    structure: string | null; // 構造: RC / SRC / 木造
    station: string | null; // 最寄駅 (without 駅)
    line: string | null;
    walk_min: number | null;
    address: string | null; // 所在地 as published
    ward: string | null;
    listed_at: string | null; // 情報公開日 YYYY-MM-DD; never an update date
    updated_at: string | null; // 情報更新日 / 情報提供日 YYYY-MM-DD
    tags: string[];
    raw: Record<string, string | null>;
}

const nfkc = (text: string): string => text.normalize('NFKC');

/**
 * '1万3740円' → 13740；'9,680万円' → 96800000；'1億2,000万円' → 120000000；'無' / 'なし' → 0.
 * The amount must lead the text and carry 億 / 万 / 円: a bare number or a month count is not yen.
 */
export const parseYen = (text: string | null): number | null => {
    if (text === null) {
        return null;
    }
    const s = nfkc(text).replaceAll(/[,\s]/g, '');
    const m = s.match(/^(?:(\d+(?:\.\d+)?)億)?(?:(\d+(?:\.\d+)?)万)?(?:(\d+(?:\.\d+)?)円?)?/);
    if (m && (m[1] || m[2] || (m[3] && s.slice(m[0].length - 1).startsWith('円')))) {
        return Math.round(Number(m[1] ?? 0) * 1e8 + Number(m[2] ?? 0) * 1e4 + Number(m[3] ?? 0));
    }
    return /^(?:無|なし)/.test(s) ? 0 : null;
};

/** '1DK ( … )' → '1DK'；'２ＳＬＤＫ' → '2SLDK'；'ワンルーム' → '1R'. */
export const parseLayout = (text: string | null): string | null => {
    if (text === null) {
        return null;
    }
    const s = nfkc(text).trim().toUpperCase();
    if (s.startsWith('ワンルーム')) {
        return '1R';
    }
    const m = s.match(/^(\d+)\s*(S?L?D?K|R)(?![A-Z])/);
    return m ? `${m[1]}${m[2]}` : null;
};

/** '1975年4月（築51年7ヶ月）' → '1975-04'. A bare age ('築7年') is not a date and stays null. */
export const parseYm = (text: string | null): string | null => {
    const m = text === null ? null : nfkc(text).match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
    return m ? `${m[1]}-${m[2].padStart(2, '0')}` : null;
};

/**
 * '地上28階地下4階建' → 28；'3階/RC3階建' → 3；'RC14階地下1階建' → 14；'地下2階付14階建' → 14.
 * A basement count written between the height and 建 is skipped, never read as the height.
 * Text without 階建 says nothing about the building.
 */
export const parseFloorsTotal = (text: string | null): number | null => {
    if (text === null) {
        return null;
    }
    const s = nfkc(text);
    const m = s.match(/地上\s*(\d+)\s*階/) ?? s.match(/(?<!地下\s*)(\d+)\s*階(?:\s*地下\s*\d+\s*階)?\s*建/);
    return m ? Number(m[1]) : null;
};

/** '10階/15階建' → '10F'；'11階建 / 3階' → '3F'；'RC 15階建/11階部分' → '11F'. */
export const parseOccupiedFloor = (text: string | null): string | null => {
    if (text === null) {
        return null;
    }
    const part = nfkc(text)
        .split(/[/／]/)
        .map((p) => p.trim())
        .find((p) => /\d\s*階/.test(p) && !p.includes('建'));
    if (part === undefined) {
        return null;
    }
    // '1-2階' is a range (メゾネット), not a basement: normalizeFloor reads a leading '-' as B.
    return normalizeFloor(
        part
            .replace('部分', '')
            .replace('地下', 'B')
            .replace(/(\d)\s*[-‐ー〜~]\s*(\d)/, '$1〜$2')
    );
};

export interface Access {
    line: string | null;
    station: string | null;
    walk_min: number | null;
}

/**
 * The first access line in any of the three spellings the portals use:
 * 'Line/駅名駅 歩6分' (SUUMO 賃貸), 'Line「駅名」徒歩5分' (SUUMO 売買, athome), 'Line 駅名駅 徒歩6分' (HOME'S).
 * A bus leg means the minutes are not a walk to the station, so walk_min stays null.
 */
export const parseAccess = (text: string | null): Access => {
    const first = text === null ? '' : nfkc(text.split('\n', 1)[0]).trim();
    const m = first.match(/^([^「]+)「([^」]+)」(.*)$/) ?? first.match(/^([^/]+)\/([^/駅]+)駅(.*)$/) ?? first.match(/^(\S+)\s+([^\s駅]+)駅(.*)$/);
    if (!m) {
        return { line: null, station: null, walk_min: null };
    }
    const rest = m[3].replace(/^\s*駅/, '');
    const walk = rest.includes('バス') ? null : rest.match(/^\s*(?:徒歩|歩)\s*(\d+)\s*分/);
    return { line: clean(m[1]), station: clean(m[2]), walk_min: walk ? Number(walk[1]) : null };
};

/** The site's own 種目 label → kind; anything not named explicitly stays null. */
export const propertyKind = (label: string | null): PropertyKind | null => {
    if (label === null) {
        return null;
    }
    if (label.includes('アパート')) {
        return 'apartment';
    }
    if (label.includes('マンション')) {
        return 'mansion';
    }
    if (/一戸建|戸建|テラスハウス|タウンハウス/.test(label)) {
        return 'house';
    }
    return /土地|売地/.test(label) ? 'land' : null;
};

const LABELS: Array<[RegExp, string]> = [
    [/^(?:所在地|住所|物件所在地)$/, 'address'],
    [/^(?:交通|駅徒歩|沿線・駅|アクセス)$/, 'access'],
    [/^(?:物件名|建物名)$/, 'building'],
    [/^部屋番号$/, 'room_no'],
    [/^(?:建物種別|物件種目|種目)$/, 'property_type'],
    [/^(?:賃料|価格|販売価格)$/, 'price'],
    [/^(?:管理費|管理費等|共益費|管理費・共益費)$/, 'management_fee'],
    [/^修繕積立金$/, 'repair_reserve'],
    [/^敷金$/, 'deposit'],
    [/^礼金$/, 'key_money'],
    [/^保証金$/, 'guarantee_deposit'],
    [/^(?:敷引・償却金?|敷引|償却)$/, 'deposit_deduction'],
    [/^間取り$/, 'layout'],
    [/^(?:間取り詳細|間取り内訳)$/, 'layout_detail'],
    [/^(?:専有面積|使用部分面積|建物面積)$/, 'area'],
    [/^土地面積$/, 'land_area'],
    [/^(?:バルコニー|バルコニー面積|その他面積)$/, 'balcony'],
    [/^(?:築年月|建築年|完成時期\(築年月\)|(?:築年月|建築年)\(築年数\))$/, 'built'],
    [/^築年数$/, 'age'],
    [/^(?:構造|建物構造|構造・階建て?|構造・規模|構造・工法)$/, 'structure'],
    [/^(?:階建|階数)$/, 'floors'],
    [/^(?:階|所在階)$/, 'floor'],
    [/^(?:向き|主要採光面)$/, 'facing'],
    [/^契約期間$/, 'contract_term'],
    [/^契約形態$/, 'contract_type'],
    [/^更新料$/, 'renewal_fee'],
    [/^保証会社$/, 'guarantor'],
    [/^(?:損保|住宅保険|保険等)$/, 'insurance'],
    [/^駐車場$/, 'parking'],
    [/^現況$/, 'status'],
    [/^(?:入居|入居可能時期|入居時期)$/, 'move_in'],
    [/^(?:引渡可能時期|引渡し|引渡|引渡時期)$/, 'handover'],
    [/^総戸数$/, 'total_units'],
    [/^用途地域$/, 'zoning'],
    [/^(?:土地権利|敷地の権利形態|土地の権利形態|土地権利形態)$/, 'land_rights'],
    [/^(?:接道状況|私道負担・道路)$/, 'road'],
    [/^都市計画$/, 'city_planning'],
    [/^建ぺい率$/, 'coverage_ratio'],
    [/^容積率$/, 'floor_area_ratio'],
    [/^建ぺい率・容積率$/, 'coverage_floor_area_ratio'],
    [/^(?:管理|管理形態)$/, 'management'],
    [/^取引態様$/, 'transaction_type'],
    [/^(?:条件|入居条件)$/, 'conditions'],
    [/^設備$/, 'facilities'],
    [/^備考$/, 'notes'],
    [/^(?:その他費用|ほか諸費用|諸費用|その他一時金)$/, 'other_fees'],
    [/^リフォーム$/, 'renovation'],
    [/^ペット$/, 'pet'],
    [/^情報公開日$/, 'listed_at'],
    [/^(?:情報更新日|情報提供日|最新情報提供日)$/, 'updated_at'],
    [/^次回更新予定日$/, 'next_update'],
];

/** A page label → its `raw` key; SUUMO's 「ヒント」 tooltips and whitespace are ignored. Unknown → null. */
export const labelKey = (label: string): string | null => {
    const s = nfkc(label).replaceAll(/\s|ヒント/g, '');
    return LABELS.find(([re]) => re.test(s))?.[1] ?? null;
};

/** Elements a page lays out on their own line; inline ones (span, sup, a) stay joined to their text. */
const BLOCK = 'address, article, aside, blockquote, dd, div, dl, dt, figure, footer, h1, h2, h3, h4, h5, h6, header, hr, li, ol, p, section, table, tbody, td, th, thead, tr, ul';

/**
 * Cell text with each <br> and each block element on its own line and every line's whitespace
 * collapsed. Without the block breaks, '<p>2026/9/5</p><p>3日前 公開</p>' reads as '2026/9/53日前',
 * a 53rd of September.
 */
const cellText = ($: CheerioAPI, el: Element): string | null => {
    const fragment = load($(el).html() ?? '', null, false);
    fragment('br').replaceWith('\n');
    fragment(BLOCK).before('\n').after('\n');
    const lines = fragment
        .root()
        .text()
        .split('\n')
        .map((l) => clean(l))
        .filter((l): l is string => l !== null);
    return lines.length === 0 ? null : lines.join('\n');
};

/**
 * th → td and dt → dd label pairs inside `scope`, keyed by `labelKey`. A compound label is split
 * when the value has as many parts: by line ('交通<br>所在地' over two lines) or by slash
 * ('敷金/礼金' over '1ヶ月/2ヶ月'). The first occurrence of a key wins, so later blocks on the
 * page (recommended listings) cannot overwrite it.
 */
export const collectPairs = ($: CheerioAPI, scope: string | Cheerio<Element>): Record<string, string | null> => {
    const out = new Map<string, string | null>();
    const put = (label: string, value: string | null) => {
        const key = labelKey(label);
        if (key !== null && !out.has(key)) {
            out.set(key, value);
        }
    };
    $(scope)
        .find('th, dt')
        .each((_, el) => {
            const next = $(el).next(el.tagName === 'th' ? 'td' : 'dd');
            if (next.length === 0) {
                return;
            }
            const labelLines = cellText($, el)?.split('\n') ?? [];
            const value = cellText($, next[0]);
            const valueLines = value?.split('\n') ?? [];
            if (labelLines.length > 1 && valueLines.length === labelLines.length) {
                for (const [i, l] of labelLines.entries()) {
                    put(l, valueLines[i]);
                }
                return;
            }
            const label = labelLines.join('');
            const labels = label.split(/[/／]/);
            const values = value?.split(/\s*[/／]\s*/) ?? [];
            if (labels.length > 1 && values.length === labels.length) {
                for (const [i, l] of labels.entries()) {
                    put(l, clean(values[i]));
                }
            } else {
                put(label, value);
            }
        });
    return Object.fromEntries(out);
};

/** 敷金 / 礼金 in the form the site used; an explicit none is zero in both forms. */
const money = (text: string | null): { months: number | null; jpy: number | null } => {
    if (text === null) {
        return { months: null, jpy: null };
    }
    if (/^(?:無|なし|無し|0円?)$/.test(nfkc(text).trim())) {
        return { months: 0, jpy: 0 };
    }
    return { months: /[ヶヵかカケ]月/.test(text) ? parseMonths(text) : null, jpy: parseYen(text) };
};

export const buildExtra = (base: { source: string; listing_id: string; deal_kind: DealKind }, raw: Record<string, string | null>, tags: string[] = []): ResidentialExtra => {
    const get = (key: string): string | null => raw[key] ?? null;
    const deposit = money(get('deposit'));
    const keyMoney = money(get('key_money'));
    const address = get('address');
    const structure = get('structure');
    return {
        ...base,
        property_type: get('property_type'),
        property_kind: propertyKind(get('property_type')),
        building_name: get('building'),
        room_no: clean(nfkc(get('room_no') ?? '')),
        price_jpy: parseYen(get('price')),
        management_fee_jpy: parseYen(get('management_fee')),
        repair_reserve_jpy: parseYen(get('repair_reserve')),
        deposit_months: deposit.months,
        deposit_jpy: deposit.jpy,
        key_money_months: keyMoney.months,
        key_money_jpy: keyMoney.jpy,
        layout: parseLayout(get('layout')),
        area_m2: parseArea(get('area')).area_m2,
        land_area_m2: parseArea(get('land_area')).area_m2,
        floor: parseOccupiedFloor(get('floor')),
        floors_total: parseFloorsTotal(get('floors')) ?? parseFloorsTotal(structure) ?? parseFloorsTotal(get('floor')),
        built_ym: parseYm(get('built')),
        // 'RC3階建' / 'RC 15階建/11階部分' / '木造/3階建' → the material: the height has its own field.
        structure: structure === null ? null : clean(nfkc(structure).replace(/[\s/]*(?:地上|地下|\d+階).*$/, '')),
        ...parseAccess(get('access')),
        address,
        ward: parseWard(address),
        listed_at: parseYmd(get('listed_at')),
        updated_at: parseYmd(get('updated_at')),
        tags,
        raw,
    };
};

/**
 * A list photo as an absolute URL, or undefined for none. A site draws a stand-in when a listing has
 * no photo (HOME'S a relative '…/no-image_208x138.png', SUUMO an absolute '…Dummy_Photo_…jpg'), and
 * the item should then carry no image rather than the stand-in.
 */
export const photoUrl = (src: string | undefined, host: string): string | undefined => {
    const s = src?.trim();
    return s === undefined || s === '' || /no[-_]?image|Dummy_Photo/i.test(s) ? undefined : new URL(s, host).href;
};

/**
 * 'セレニティコート虎ノ門 1101 1K' — building, then the room number or floor, then the layout. A unit
 * with no building name (most houses) is named by its address: the 種目 is the same for every item
 * of a feed and would not tell them apart.
 */
export const residentialTitle = (x: ResidentialExtra): string => [x.building_name ?? x.address ?? x.property_type, x.room_no ?? x.floor, x.layout].filter((p): p is string => p !== null).join(' ') || x.listing_id;

const yen = (n: number): string => `${n.toLocaleString('ja-JP')}円`;

const lumpSum = (label: string, months: number | null, jpy: number | null): string | null => {
    if (months !== null) {
        return `${label} ${months}ヶ月`;
    }
    return jpy === null ? null : `${label} ${yen(jpy)}`;
};

/** Structured one-line summary used as the item description. */
export const summarizeResidential = (x: ResidentialExtra): string =>
    [
        x.price_jpy === null ? null : `${x.deal_kind === 'rent' ? '賃料' : '価格'} ${yen(x.price_jpy)}`,
        x.management_fee_jpy === null ? null : `管理費 ${yen(x.management_fee_jpy)}`,
        x.repair_reserve_jpy === null ? null : `修繕積立金 ${yen(x.repair_reserve_jpy)}`,
        lumpSum('敷金', x.deposit_months, x.deposit_jpy),
        lumpSum('礼金', x.key_money_months, x.key_money_jpy),
        x.layout,
        x.area_m2 === null ? null : `${x.area_m2}㎡`,
        x.land_area_m2 === null ? null : `土地 ${x.land_area_m2}㎡`,
        x.floor === null ? null : x.floors_total === null ? x.floor : `${x.floor}/${x.floors_total}階建`,
        x.built_ym === null ? null : `築 ${x.built_ym}`,
        x.station === null ? null : `${x.station}駅 徒歩${x.walk_min ?? '?'}分`,
        x.address,
    ]
        .filter((p): p is string => p !== null)
        .join(' / ');

/** One unit as a list page shows it: the site's id, its detail link and the list's own label text. */
export interface ListedUnit {
    id: string;
    link: string;
    raw: Record<string, string | null>;
    tags: string[];
    image?: string;
}

/**
 * The list is read fresh on every poll, so its values win; the detail page (cached) only fills
 * what the list left empty. Price changes therefore show up on the next poll, not the next cache expiry.
 */
export const mergeRaw = (list: Record<string, string | null>, detail: Record<string, string | null>): Record<string, string | null> => ({
    ...list,
    ...detail,
    ...Object.fromEntries(Object.entries(list).filter(([, v]) => v !== null)),
});

/** Detail pages are fetched a few at a time: one feed should not burst a portal with its whole page at once. */
const DETAIL_CONCURRENCY = 3;
/**
 * Detail fields are kept for a fixed six hours and not renewed when read: renewed, a listing that
 * stays on the first page would keep its first 管理費 / 情報更新日 for as long as it stayed there.
 */
const DETAIL_MAX_AGE = 6 * 60 * 60;

/**
 * Units → feed items. With `readDetail`, each unit's own page is fetched once and its label pairs
 * cached per listing; a detail page that fails is logged and the unit keeps its list fields, since
 * one unreadable listing must not cost the rest of the feed. A page with no labelled field at all
 * (a challenge or error page served with 200) counts as failed, so it is never cached as the answer.
 *
 * `maxFetches` caps the detail pages one run may request; cache hits do not count. Units past the
 * cap keep their list fields this run and are read on a later one, as the cache fills — for a site
 * that refuses a client after a handful of requests.
 */
export const residentialItems = async (
    units: ListedUnit[],
    base: { source: string; deal_kind: DealKind },
    readDetail: ((html: string) => Record<string, string | null>) | null,
    fetchPage: (url: string) => Promise<string> = (url) => ofetch<string>(url),
    options: { maxFetches?: number } = {}
): Promise<Array<DataItem & { _extra: ResidentialExtra }>> => {
    let fetches = 0;
    let deferred = 0;
    const items = await pMap(
        units,
        async (unit) => {
            let detail: Record<string, string | null> = {};
            if (readDetail !== null) {
                try {
                    detail = await cache.tryGet(
                        `${base.source}:detail:${unit.id}`,
                        async () => {
                            if (options.maxFetches !== undefined && fetches >= options.maxFetches) {
                                throw new DetailDeferred();
                            }
                            fetches += 1;
                            const pairs = readDetail(await fetchPage(unit.link));
                            if (Object.keys(pairs).length === 0) {
                                throw new Error('the page carried no labelled field');
                            }
                            return pairs;
                        },
                        DETAIL_MAX_AGE,
                        false
                    );
                } catch (error) {
                    if (error instanceof DetailDeferred) {
                        deferred += 1;
                    } else {
                        logger.warn(`${base.source}: detail page ${unit.link} failed: ${String(error)}`);
                    }
                }
            }
            const extra = buildExtra({ ...base, listing_id: unit.id }, mergeRaw(unit.raw, detail), unit.tags);
            return {
                title: residentialTitle(extra),
                link: unit.link,
                guid: unit.link,
                pubDate: extra.listed_at === null ? undefined : timezone(parseDate(extra.listed_at, 'YYYY-MM-DD'), 9),
                description: summarizeResidential(extra),
                image: unit.image,
                _extra: extra,
            };
        },
        { concurrency: DETAIL_CONCURRENCY }
    );
    if (deferred > 0) {
        logger.info(`${base.source}: ${deferred} of ${units.length} detail pages left for a later run (at most ${options.maxFetches} per run)`);
    }
    return items;
};

/** A detail page not requested this run because the run's `maxFetches` is spent. */
class DetailDeferred extends Error {}
