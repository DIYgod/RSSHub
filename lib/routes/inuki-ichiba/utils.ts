/**
 * Text → structure helpers for 居抜き市場 listing pages.
 * Unknown values are `null`, never `0`; site text is kept verbatim in `raw`.
 */

export type ListingCondition = 'inuki' | 'skeleton';

export interface ListingExtra {
    source: 'inuki-ichiba';
    listing_id: string;
    rent_jpy: number | null; // 賃料（税込、円/月）
    tsubo: number | null; // 坪
    area_m2: number | null; // ㎡
    tsubo_unit_jpy: number | null; // 坪単価（賃料 ÷ 坪）
    floor: string | null; // 1F / B1F / 1F〜2F
    station: string | null; // 最寄駅（without 駅）
    line: string | null; // 路線
    walk_min: number | null; // 徒歩（分）
    deposit_months: number | null; // 敷金・保証金（賃料の何ヶ月分）
    deposit_jpy: number | null; // 敷金・保証金（金額）
    key_money_months: number | null; // 礼金（site does not publish; always null）
    fixtures_transfer_jpy: number | null; // 造作価格；無償譲渡 = 0，相談 = null
    condition: ListingCondition | null; // 物件タイプ
    prev_business: string | null; // 現業態
    heavy_food_ok: boolean | null; // 飲食条件 → 重飲食可否
    business_limit: string | null; // 飲食条件（原文）
    listed_at: string | null; // site does not publish; always null
    ward: string | null; // 区 / 市
    address_hint: string | null; // 区 + 町
    tags: string[];
    raw: Record<string, string | null>;
}

const TSUBO_M2 = 3.30579;

/** Collapse whitespace from cheerio `.text()`; empty → null. */
export const clean = (text: string | undefined | null): string | null => {
    const s = (text ?? '').replaceAll(/\s+/g, ' ').trim();
    return s === '' ? null : s;
};

const isUnknown = (text: string): boolean => /^(?:[-－―—]|ご?相談|要相談|応相談|未定|非公開)?$/.test(text);

/** '352,000円(税込)' → 352000；'160万円' → 1600000；'無償譲渡' → 0；'相談' / '' → null。 */
export const parseJpy = (text: string | null): number | null => {
    if (text === null) {
        return null;
    }
    const s = text.replaceAll(/[,，\s]/g, '');
    if (/無償|なし|無し/.test(s)) {
        return 0;
    }
    if (isUnknown(s)) {
        return null;
    }
    // Without 円 / 万 only a bare number is accepted ('3ヶ月' is not an amount).
    if (!/[円万億]/.test(s) && !/^\d+(?:\.\d+)?$/.test(s)) {
        return null;
    }
    const oku = s.match(/^(\d+(?:\.\d+)?)億(?:(\d+(?:\.\d+)?)万)?/);
    if (oku) {
        return Math.round(Number(oku[1]) * 1e8 + (oku[2] ? Number(oku[2]) * 1e4 : 0));
    }
    const m = s.match(/\d+(?:\.\d+)?/);
    if (!m) {
        return null;
    }
    const n = Number(m[0]);
    return Math.round(s.includes('万') ? n * 1e4 : n);
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** '16.55坪 (54.74㎡)' / '70㎡' → { tsubo, area_m2 }, the missing side converted at 3.30579. */
export const parseArea = (text: string | null): { tsubo: number | null; area_m2: number | null } => {
    if (text === null) {
        return { tsubo: null, area_m2: null };
    }
    const s = text.replaceAll(/[,，]/g, '');
    const tsubo = s.match(/(\d+(?:\.\d+)?)\s*坪/)?.[1];
    const m2 = s.match(/(\d+(?:\.\d+)?)\s*(?:㎡|m²|m2|平米)/)?.[1];
    const t = tsubo ? Number(tsubo) : m2 ? round2(Number(m2) / TSUBO_M2) : null;
    const a = m2 ? Number(m2) : tsubo ? round2(Number(tsubo) * TSUBO_M2) : null;
    return { tsubo: t, area_m2: a };
};

/** 'N ヶ月 / ヵ月 / か月 / カ月' → N；'なし' → 0；'相談' / '' → null。 */
export const parseMonths = (text: string | null): number | null => {
    if (text === null) {
        return null;
    }
    const s = text.replaceAll(/\s/g, '');
    if (/なし|無し/.test(s)) {
        return 0;
    }
    const m = s.match(/(\d+(?:\.\d+)?)[ヶヵかカケ]月/);
    return m?.[1] ? Number(m[1]) : null;
};

/** '徒歩6分' → 6。 */
export const parseWalkMin = (text: string | null): number | null => {
    const m = text?.match(/(\d+)\s*分/);
    return m?.[1] ? Number(m[1]) : null;
};

/** '1F' → '1F'，'-1F' → 'B1F'，'1F～2F' → '1F〜2F'。 */
export const normalizeFloor = (text: string | null): string | null => {
    const tokens = text?.match(/(?:B|-)?\d+/gi);
    if (!tokens) {
        return null;
    }
    return tokens.map((t) => (/^(?:B|-)/i.test(t) ? `B${t.slice(1)}F` : `${t}F`)).join('〜');
};

/** '台東区浅草橋5丁目' → '台東区'；'藤沢市鵠沼石上1丁目' → '藤沢市'。 */
export const parseWard = (address: string | null): string | null => {
    if (address === null) {
        return null;
    }
    const s = address.replace(/^(?:東京都|北海道|(?:京都|大阪)府|\S{2,3}県)/, '');
    // 区 first, then 市 / 郡, then 町 / 村, so 東村山市 does not become 東村.
    for (const re of [/^(.+?区)/, /^(.+?市)/, /^(.+?郡)/, /^(.+?(?:町|村))/]) {
        const m = s.match(re);
        if (m?.[1]) {
            return m[1];
        }
    }
    return null;
};

/** 物件タイプ：居抜き → inuki；スケルトン → skeleton；otherwise null. */
export const parseCondition = (text: string | null): ListingCondition | null => {
    if (text === null) {
        return null;
    }
    if (/居抜き|居抜/.test(text)) {
        return 'inuki';
    }
    if (text.includes('スケルトン')) {
        return 'skeleton';
    }
    return null;
};

/** 飲食条件：'重飲食可' → true；'重飲食不可' / '飲食不可' → false；plain '飲食可' → null. */
export const parseHeavyFood = (text: string | null): boolean | null => {
    if (text === null) {
        return null;
    }
    // Negation first: '重飲食不可' also contains '重飲食'.
    if (/重飲食(?:・[^\s/]+)?\s*(?:不可|NG|×)|飲食\s*不可/.test(text)) {
        return false;
    }
    if (/重飲食\s*(?:可|OK|○)/.test(text)) {
        return true;
    }
    return null;
};

/** 賃料 ÷ 坪 (the site does not give 坪単価). */
export const tsuboUnit = (rentJpy: number | null, tsubo: number | null): number | null => (rentJpy !== null && tsubo !== null && tsubo > 0 ? Math.round(rentJpy / tsubo) : null);

/** Structured one-line summary used as the item description. */
export const summarize = (x: ListingExtra): string =>
    [
        x.rent_jpy === null ? null : `賃料 ${x.rent_jpy.toLocaleString('ja-JP')}円`,
        x.tsubo === null ? null : `${x.tsubo}坪`,
        x.floor,
        x.station === null ? null : `${x.station}駅 徒歩${x.walk_min ?? '?'}分`,
        x.condition === 'inuki' ? '居抜き' : x.condition === 'skeleton' ? 'スケルトン' : null,
        x.prev_business === null ? null : `現況 ${x.prev_business}`,
        x.fixtures_transfer_jpy === null ? null : `造作 ${x.fixtures_transfer_jpy === 0 ? '無償' : `${x.fixtures_transfer_jpy.toLocaleString('ja-JP')}円`}`,
        x.ward,
    ]
        .filter((p): p is string => p !== null)
        .join(' / ');
