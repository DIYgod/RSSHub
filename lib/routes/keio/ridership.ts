import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { RidershipExtra } from '@/routes/tokyometro/utils';
import { cellText, parseCount, parseFiscalYear, ridershipItem } from '@/routes/tokyometro/utils';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const LINK = 'https://www.keio.co.jp/company/corporate/corporate_manual/number-of-passengers.html';
const OPERATOR = '京王電鉄';

interface StationRow {
    station: string;
    values: string[]; // one cell per year column, in header order
    note: string; // the following （…乗換） row, e.g. '（井の頭線乗換） (151,951) (150,383)'
}

/**
 * 駅別 一日平均乗降人員 — a single page with two `table.h-b-table` (京王線 / 井の頭線):
 *   row 1: <th colspan=3> line name; row 2 (`tr.tb-sub-header`): 駅名 | 2025年度 | 2024年度; then one row per station.
 * A row whose 駅名 is parenthesised (（井の頭線乗換） (151,951) …) is the transfer count of the station above it, not a
 * station; a blank spacer row and the 全線計 row are skipped. Neither 順位 nor 前年比 is printed.
 */
const parseTable = ($: CheerioAPI, table: Element): { line: string | null; years: number[]; rows: StationRow[] } => {
    const trs = $(table).find('tr').toArray();
    const line = cellText($(trs[0]).find('th').text()) || null;
    const headerCells = $(trs[1])
        .find('td')
        .toArray()
        .map((td) => cellText($(td).text()));
    const years = headerCells.slice(1).map((h) => parseFiscalYear(h));
    if (headerCells[0] !== '駅名' || years.some((y) => y === null)) {
        return { line, years: [], rows: [] };
    }

    const rows: StationRow[] = [];
    for (const tr of trs.slice(2)) {
        const [station = '', ...values] = $(tr)
            .find('td')
            .toArray()
            .map((td) => cellText($(td).text()));
        if (station === '' || station === '全線計') {
            continue;
        }
        const last = rows.at(-1);
        if (/^[（(]/.test(station) && last) {
            rows[rows.length - 1] = { ...last, note: [station, ...values].join(' ').trim() };
            continue;
        }
        rows.push({ station, values, note: '' });
    }
    return { line, years: years as number[], rows };
};

const round1 = (n: number): number => Math.round(n * 10) / 10;

const parsePage = (html: string): { years: number[]; items: Array<ReturnType<typeof ridershipItem>> } => {
    const $ = load(html);
    const tables = $('table.h-b-table')
        .toArray()
        .map((table) => parseTable($, table));
    const years = [...new Set(tables.flatMap((t) => t.years))].toSorted((a, b) => b - a);
    if (years.length === 0) {
        throw new Error('keio: no 年度 columns found');
    }

    const items = tables.flatMap(({ line, years: cols, rows }) =>
        rows.flatMap((row) =>
            cols.map((fy, i) => {
                const value = row.values[i] ?? '';
                const prev = cols.includes(fy - 1) ? (row.values[cols.indexOf(fy - 1)] ?? '') : '';
                const [n, p] = [parseCount(value), parseCount(prev)];
                const raw: RidershipExtra['raw'] = Object.fromEntries([['station', row.station], ...cols.map((y, j) => [`${y}年度`, row.values[j] ?? '']), ...(row.note ? [['note', row.note]] : [])]);
                const extra: RidershipExtra = {
                    source: 'keio',
                    operator: OPERATOR,
                    station: row.station,
                    line,
                    fiscal_year: fy,
                    daily_average: n,
                    unit: '人/日',
                    rank: null,
                    // The page prints no 前年比; when it prints the previous year's column, the change is computed from the two cells.
                    yoy_pct: n !== null && p !== null && p > 0 ? round1((n / p - 1) * 100) : null,
                    raw,
                };
                return ridershipItem(extra, LINK);
            })
        )
    );
    return { years, items };
};

export const handler = async (): Promise<Data> => {
    const page = (await cache.tryGet(LINK, async () => parsePage(await ofetch(LINK)))) as ReturnType<typeof parsePage>;
    return {
        title: `京王電鉄 駅別 一日平均乗降人員（${page.years.map((y) => `${y}年度`).join('・')}）`,
        link: LINK,
        language: 'ja',
        item: page.items,
    };
};

export const route: Route = {
    path: '/ridership',
    name: '駅別 一日平均乗降人員',
    url: 'www.keio.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/keio/ridership',
    parameters: {},
    description: `Annual 駅別 一日平均乗降人員 for every Keio station (京王線 incl. 相模原線・高尾線 etc., and 井の頭線), from [駅別 一日平均乗降人員](${LINK}). The page lists the latest fiscal year and the one before it side by side, so there is one item per station and year (two per station); there is no year parameter. \`_extra\` carries \`operator\`, \`station\`, \`line\`, \`fiscal_year\`, \`daily_average\` (人/日) and both cells in \`raw\`. \`rank\` is \`null\` (no ranking is printed); \`yoy_pct\` is computed from the two year columns for the latest year (rounded to 0.1) and \`null\` for the earlier one. 明大前's （乗換） transfer count is kept in \`raw.note\`; the 全線計 row is not a station and is skipped. The operator does not publish a release date, so items have no \`pubDate\`.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.keio.co.jp/company/corporate/corporate_manual/number-of-passengers.html'],
            target: '/ridership',
        },
    ],
};
