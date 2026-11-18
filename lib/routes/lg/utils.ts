import { calendarToInstant, formatDate } from '@/utils/time';

/** Minimal RFC 4180 CSV parser: quoted fields, `""` escapes, newlines inside quotes, CRLF. */
const parseCsv = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c !== '"') {
                field += c;
            } else if (text[i + 1] === '"') {
                field += '"';
                i++;
            } else {
                quoted = false;
            }
            continue;
        }
        switch (c) {
            case '"':
                quoted = true;
                break;
            case ',':
                row.push(field);
                field = '';
                break;
            case '\r':
            case '\n':
                if (c === '\r' && text[i + 1] === '\n') {
                    i++;
                }
                row.push(field);
                rows.push(row);
                row = [];
                field = '';
                break;
            default:
                field += c;
        }
    }
    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows;
};

/** CSV text → records keyed by the header row; a missing cell is `null`. */
export const csvRecords = (text: string): Array<Record<string, string | null>> => {
    const [header, ...rows] = parseCsv(text);
    if (!header) {
        return [];
    }
    return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(header.map((k, i) => [k, r[i] ?? null])));
};

export type Row = Record<string, string | null>;

/** Normalised permit fields shared by the lg food-permit routes; the publisher's original columns stay verbatim in `raw`. */
export interface PermitExtra {
    source: string;
    ward: string;
    permit_no: string;
    name: string;
    address: string | null;
    town: string | null; // 施設所在地_町字, the finest area unit the 自治体標準オープンデータ schema carries
    permit_date: string | null; // YYYY-MM-DD
    first_permit_date: string | null; // YYYY-MM-DD; earlier than permit_date once a permit has been renewed
    expires_at: string | null; // YYYY-MM-DD, 許可満了日
    closed_date: string | null; // YYYY-MM-DD, 廃業日; non-null means the business has already closed
    business_type: string | null;
    lat: number | null;
    lon: number | null;
    raw: Row;
}

const ERAS = { 令和: 'reiwa', 平成: 'heisei', 昭和: 'showa' } as const;
type Era = keyof typeof ERAS;
const isEra = (s: string): s is Era => Object.hasOwn(ERAS, s);

/** `2024-04-08` / `2026/8/7` / `令和8年8月7日` → `YYYY-MM-DD`; anything else → null. */
export const isoDate = (raw: string | null): string | null => {
    if (raw === null) {
        return null;
    }
    const s = raw.normalize('NFKC');
    const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(s);
    if (m) {
        return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    }
    const w = /^(令和|平成|昭和)(元|\d{1,2})年(\d{1,2})月(\d{1,2})日/.exec(s);
    if (!w || !isEra(w[1])) {
        return null;
    }
    const date = calendarToInstant({ calendar: 'japanese', era: ERAS[w[1]], year: w[2] === '元' ? 1 : w[2], month: w[3], day: w[4] });
    return date ? formatDate(date, 'YYYY-MM-DD') : null;
};

/** Ward sites serve CSV as UTF-8 (with BOM) one month and Shift_JIS the next, so sniff: strict UTF-8 first, else Shift_JIS. */
export const decodeText = (buf: ArrayBuffer): string => {
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch {
        return new TextDecoder('shift_jis').decode(buf);
    }
};

/** Sort key for `令和8年7月分`-style labels (full-width digits allowed): `2026-07`; null when absent. */
export const warekiMonth = (label: string): string | null => {
    const m = /(令和|平成)(元|\d{1,2})年(\d{1,2})月/.exec(label.normalize('NFKC'));
    const date = m && isEra(m[1]) ? calendarToInstant({ calendar: 'japanese', era: ERAS[m[1]], year: m[2] === '元' ? 1 : m[2], month: m[3], day: 1 }) : undefined;
    return date ? formatDate(date, 'YYYY-MM') : null;
};
