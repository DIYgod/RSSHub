/**
 * Shared shape + helpers for the 駅別乗降人員 (station ridership) routes of Tokyo private railways
 * (tokyometro / tokyu / odakyu / keio). One item per station per fiscal year; unknown = `null`, never `0`;
 * the operator's cell text is kept verbatim in `raw`.
 */

import type { DataItem } from '@/types';

export type RidershipSource = 'tokyometro' | 'tokyu' | 'odakyu' | 'keio';

export interface RidershipExtra {
    source: RidershipSource;
    operator: string; // 東京メトロ / 東急電鉄 / 小田急電鉄 / 京王電鉄
    station: string; // as printed by the operator (without 駅)
    line: string | null; // 路線; several lines joined with '・' when the operator lists a station once for all of them
    fiscal_year: number; // 2025 = FY2025 (2025-04 … 2026-03)
    daily_average: number | null; // 一日平均乗降人員
    unit: '人/日';
    rank: number | null; // only when the operator publishes a 順位
    yoy_pct: number | null; // 前年比 / 増減率 (%); negative when the operator prints ▲ or a minus
    raw: Record<string, string>;
}

/** Collapse whitespace (incl. NBSP) from cheerio `.text()`. */
export const cellText = (text: string | undefined | null): string => (text ?? '').replaceAll(/\s+/g, ' ').trim();

/** '529,947' → 529947; '－' / '' / '(151,951)' (a parenthesised note) → null. */
export const parseCount = (text: string): number | null => {
    const s = text.replaceAll(/[,，\s]/g, '').normalize('NFKC');
    return /^\d+$/.test(s) ? Number(s) : null;
};

/** '2.3' → 2.3; '▲ 11.9' / '-0.1' / '△0.8' → negative; '' / '-' → null. */
export const parsePct = (text: string): number | null => {
    const s = text.replaceAll(/[\s,]/g, '').normalize('NFKC');
    const m = s.match(/^([▲△-])?(\d+(?:\.\d+)?)$/);
    if (!m) {
        return null;
    }
    const n = Number(m[2]);
    return m[1] ? -n : n;
};

/** '2025年度' anywhere in the text → 2025; nothing → null. */
export const parseFiscalYear = (text: string): number | null => {
    const m = text.match(/(\d{4})年度/);
    return m ? Number(m[1]) : null;
};

/** Item title / guid / description are derived from `_extra` only, so all four operators read the same way. */
export const ridershipItem = (extra: RidershipExtra, link: string): DataItem & { _extra: RidershipExtra } => {
    const people = extra.daily_average === null ? '不明' : `${extra.daily_average.toLocaleString('ja-JP')}人/日`;
    const yoy = extra.yoy_pct === null ? null : `前年比 ${extra.yoy_pct > 0 ? '+' : ''}${extra.yoy_pct}%`;
    return {
        title: `${extra.station}（${extra.line ?? extra.operator}） ${extra.fiscal_year}年度 ${people}`,
        link,
        guid: `${extra.source}/ridership:${extra.fiscal_year}:${extra.line ?? '-'}:${extra.station}`,
        // Operators do not publish a release date for the table; no pubDate is fabricated.
        description: [extra.operator, extra.line, `${extra.fiscal_year}年度`, people, yoy, extra.rank === null ? null : `${extra.rank}位`].filter((p): p is string => p !== null).join(' / '),
        _extra: extra,
    };
};
