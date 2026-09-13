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
