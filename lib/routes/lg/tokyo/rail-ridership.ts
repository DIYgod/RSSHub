import type { RidershipExtra } from '@/routes/tokyometro/utils';
import { parseCount, ridershipItem } from '@/routes/tokyometro/utils';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { csvRecords, type Row } from '../utils';

/**
 * 駅別乗降車人員 from the 東京都統計年鑑 (CC BY 4.0), which restates the figures 私鉄各社 and the subway
 * operators report to 東京都. Unlike the operators' own pages this is a single permissively licensed file,
 * and it is the only source covering ゆりかもめ / りんかい線 / つくばエクスプレス — whose own sites either
 * publish nothing per-station or forbid reuse.
 *
 * The figures are one-year totals in 千人, not the 一日平均 the operators publish, so items carry
 * `annual_total` + `unit: '千人/年'` and leave `daily_average` null. The route never converts between them.
 */

const CATALOG = 'https://catalog.data.metro.tokyo.lg.jp/api/3/action/package_search';
const LANDING = 'https://catalog.data.metro.tokyo.lg.jp/dataset/t000003d2000001150';
const BOARDING = '乗車人員 Boarding passengers／総数 Total';

/** The table number shifts between editions (私鉄 was 4-12 in 令和6年, 4-13 in 令和5年), so tables are resolved by resource name. */
const TABLES = {
    private: { resource: '私鉄の駅別乗降車人員', label: '私鉄' },
    subway: { resource: '地下鉄の駅別乗降車人員', label: '地下鉄' },
} as const;

type Table = keyof typeof TABLES;

interface Resource {
    name: string;
    url: string;
}

/** Newest 統計年鑑「運輸・観光」 edition, then the requested table inside it. The dataset id is edition-specific too, so it is searched for rather than hardcoded. */
const resolveCsv = async (table: Table): Promise<string> => {
    const params = new URLSearchParams({ q: '統計年鑑 運輸', rows: '10', sort: 'metadata_modified desc' });
    const body = await ofetch(`${CATALOG}?${params.toString()}`);
    const datasets: Array<{ title: string; resources: Resource[] }> = body?.result?.results ?? [];
    const dataset = datasets.find((d) => d.title.includes('統計年鑑') && d.title.includes('運輸'));
    const url = dataset?.resources.find((r) => r.name.includes(TABLES[table].resource))?.url;
    if (!url) {
        throw new Error(`lg/tokyo/rail-ridership: no 「${TABLES[table].resource}」 resource in the current 統計年鑑`);
    }
    return url;
};

/**
 * The file interleaves rollup rows with station rows: a company total leaves both 系統 and 駅 empty, a line
 * total leaves 駅 empty, and 会社名「総数」 is the grand total. Only rows naming a station are real.
 * (マーク cannot be used to tell them apart — ◎ marks a transfer station and ※ a station inside the 23 区,
 * and both appear on station rows as well.)
 */
const stationRows = (rows: Row[]): Row[] => rows.filter((r) => (r['駅'] ?? '').trim() !== '' && (r['会社名'] ?? '').trim() !== '総数');

const toItem = (row: Row, table: Table) => {
    const station = (row['駅'] ?? '').trim();
    const operator = (row['会社名'] ?? '').trim();
    const line = (row['系統'] ?? '').trim() || null;
    const raw = Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? '']));
    const extra: RidershipExtra = {
        source: 'toukei-tokyo',
        operator,
        station,
        line,
        fiscal_year: Number((row['Fiscal year'] ?? '').trim()),
        daily_average: null,
        annual_total: parseCount(row[BOARDING] ?? ''),
        unit: '千人/年',
        // The table publishes 乗車 and 降車 in separate columns; summing them would be arithmetic on
        // published figures, so the item carries 乗車 and leaves 降車 verbatim in `raw`.
        measure: 'boarding',
        rank: null,
        yoy_pct: null,
        raw,
    };
    return ridershipItem(extra, `${LANDING}#${table}`);
};

export const handler = async (ctx): Promise<Data> => {
    const table: string = ctx.req.param('table') ?? 'private';
    if (!Object.hasOwn(TABLES, table)) {
        throw new Error(`Unknown table "${table}", expected one of ${Object.keys(TABLES).join(', ')}`);
    }
    const items = (await cache.tryGet(`lg/tokyo/rail-ridership:${table}`, async () => {
        const csv: string = await ofetch(await resolveCsv(table as Table), { responseType: 'text' });
        return stationRows(csvRecords(csv.replace(/^\u{FEFF}/u, ''))).map((row) => toItem(row, table as Table));
    })) as Array<ReturnType<typeof toItem>>;

    return {
        title: `東京都統計年鑑 ${TABLES[table as Table].label}の駅別乗降車人員`,
        link: LANDING,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/tokyo/rail-ridership/:table?',
    name: '東京都統計年鑑 駅別乗降車人員',
    url: 'catalog.data.metro.tokyo.lg.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/lg/tokyo/rail-ridership',
    parameters: {
        table: {
            description: 'Which yearbook table to read; defaults to 私鉄',
            options: [
                { value: 'private', label: '私鉄の駅別乗降車人員' },
                { value: 'subway', label: '地下鉄の駅別乗降車人員' },
            ],
        },
    },
    description: `Per-station yearly ridership for Tokyo's private railways and subways, from the [東京都統計年鑑 運輸・観光](${LANDING}) (CC BY 4.0). One item per station and fiscal year.

This is the only permissively licensed source covering ゆりかもめ, りんかい線 (東京臨海高速鉄道) and つくばエクスプレス (首都圏新都市鉄道) — their own sites either publish no per-station table or forbid reuse.

Read the figures carefully:

- They are **one-year totals in 千人**, not the 一日平均 in 人/日 that operators publish. \`_extra\` carries \`annual_total\` with \`unit: '千人/年'\` and leaves \`daily_average\` null; the route never converts between the two.
- The table gives 乗車人員 and 降車人員 in separate columns. The item carries 乗車 (\`measure: 'boarding'\`) and leaves 降車 verbatim in \`raw\`, rather than summing them.
- Only stations **within 東京都** are listed, so a line is truncated at the prefecture border. The publisher's \`マーク\` column (kept in \`raw\`) marks 「◎ 同一会社内の乗換え駅」 and 「※ 区部にある駅 (線)」.
- Figures 「同一会社内の乗り継ぎは除く」 (exclude transfers within the same company).

The table number changes between editions (私鉄 was 4-12 in 令和6年 but 4-13 in 令和5年), so the route resolves the current edition and table through the catalog API by name rather than a fixed URL.

Attribution required by the licence: 出典：東京都統計年鑑（東京都総務局統計部）.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
    },
};
