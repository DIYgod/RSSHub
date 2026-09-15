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

/** CSV text → records keyed by the (trimmed) header row; a missing cell is `null`. */
export const csvRecords = (text: string): Array<Record<string, string | null>> => {
    const [header, ...rows] = parseCsv(text);
    if (!header) {
        return [];
    }
    const keys = header.map((h) => h.trim());
    return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? null])));
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

const ERA_BASE: Record<string, number> = { 令和: 2018, 平成: 1988, 昭和: 1925 };

/** `2024-04-08` / `2026/8/7` / `令和8年8月7日` → `YYYY-MM-DD`; anything else → null. */
export const isoDate = (raw: string | null): string | null => {
    if (raw === null) {
        return null;
    }
    const s = raw.normalize('NFKC').trim();
    const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(s);
    if (m) {
        return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    }
    const w = /^(令和|平成|昭和)(元|\d{1,2})年(\d{1,2})月(\d{1,2})日/.exec(s);
    if (!w) {
        return null;
    }
    const year = ERA_BASE[w[1]] + (w[2] === '元' ? 1 : Number(w[2]));
    return `${year}-${w[3].padStart(2, '0')}-${w[4].padStart(2, '0')}`;
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
    return m ? `${ERA_BASE[m[1]] + (m[2] === '元' ? 1 : Number(m[2]))}-${m[3].padStart(2, '0')}` : null;
};
