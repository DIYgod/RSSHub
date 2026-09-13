import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { csvRecords } from './utils';

/**
 * 飲食店営業許可 (food business permits) newly granted in Tokyo wards, from each ward's CC BY open data.
 *
 * Only two of the 23 wards publish a machine-readable, regularly updated 台帳:
 *   shibuya — 渋谷区 ArcGIS FeatureServer (complete ledger incl. 廃業; the current and previous month are queried)
 *   minato  — 港区 自治体標準オープンデータ CSV (snapshot of valid permits, monthly, ~2 MB)
 * Rows are the publisher's original columns and are exposed verbatim in `_extra.raw`.
 */

type Source = 'shibuya' | 'minato';
type Row = Record<string, string | null>;

export interface PermitExtra {
    source: Source;
    ward: string;
    permit_no: string;
    name: string;
    address: string | null;
    permit_date: string | null; // YYYY-MM-DD
    business_type: string | null;
    raw: Row;
}

const SOURCES: Record<Source, { label: string; link: string }> = {
    shibuya: {
        label: '渋谷区',
        link: 'https://city-shibuya-data.opendata.arcgis.com/items/e68f41ebfa5f4ea490ca9af701d44e02',
    },
    minato: {
        label: '港区',
        link: 'https://catalog.data.metro.tokyo.lg.jp/dataset/t131032d0000000244',
    },
};
const SHIBUYA_QUERY = 'https://services3.arcgis.com/UtdeFTavkHfI94t2/arcgis/rest/services/131130_food_businesses_list/FeatureServer/0/query';
const SHIBUYA_DATE = '許可開始日もしくは届出受理日';
const MINATO_CSV = 'https://opendata.city.minato.tokyo.jp/dataset/54d8c582-00e2-4730-a23f-4a5befec9ae5/resource/c9d0299e-8e05-4317-877f-83055709e41f/download/food_business_all.csv';
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const DATE_COLS = ['許可年月日', SHIBUYA_DATE, '許可開始日', '許可日'];

const pick = (row: Row, cols: readonly string[]): string | null => {
    for (const c of cols) {
        const v = row[c]?.trim();
        if (v) {
            return v;
        }
    }
    return null;
};

/** `2024-04-08` / `2026/8/7` → `YYYY-MM-DD`; anything else (和暦 …) → null. */
const isoDate = (raw: string | null): string | null => {
    const m = raw === null ? null : /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(raw.normalize('NFKC'));
    return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : null;
};

/** 渋谷区 stores dates as text (`2026/8/7`), so the current and previous month (JST) are selected with LIKE and sorted locally. */
const shibuyaQueryUrl = (now: Date): string => {
    const jst = new Date(now.getTime() + 9 * 3600 * 1000);
    const months = [0, 1].map((back) => {
        const d = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth() - back, 1));
        return `${d.getUTCFullYear()}/${d.getUTCMonth() + 1}/`;
    });
    const params = new URLSearchParams({
        where: months.map((m) => `${SHIBUYA_DATE} LIKE '${m}%'`).join(' OR '),
        outFields: '*',
        returnGeometry: 'false',
        resultRecordCount: '1000',
        f: 'json',
    });
    return `${SHIBUYA_QUERY}?${params.toString()}`;
};

const fetchShibuya = async (): Promise<Row[]> => {
    const body = await ofetch(shibuyaQueryUrl(new Date()));
    const features: Array<{ attributes: Record<string, unknown> }> = body?.features ?? [];
    return features.map((f) => Object.fromEntries(Object.entries(f.attributes).map(([k, v]) => [k, v === null || v === undefined ? null : String(v)])));
};

const fetchMinato = async (): Promise<Row[]> => csvRecords(await ofetch(MINATO_CSV, { responseType: 'text' }));

const toItem = (source: Source, raw: Row): DataItem & { _extra: PermitExtra } => {
    const permitNo = pick(raw, ['許可番号']) ?? '';
    const name = pick(raw, ['施設名称', '屋号']) ?? '(名称なし)';
    const address = pick(raw, ['所在地_連結表記', '施設所在地_連結表記']);
    const permitDate = isoDate(pick(raw, DATE_COLS));
    const businessType = pick(raw, ['営業の種類', '営業の種類もしくは営業の形態', '業種']);
    const ward = (pick(raw, ['施設所在地_市区町村', '地方公共団体名']) ?? SOURCES[source].label).replace(/^東京都/, '');
    return {
        title: `${name}（${businessType ?? '業種不明'}）`,
        guid: `lg/tokyo/food-permit:${source}:${permitNo}`,
        link: SOURCES[source].link,
        pubDate: permitDate === null ? undefined : timezone(parseDate(permitDate, 'YYYY-MM-DD'), 9),
        description: [ward, address, businessType, permitDate, `許可番号 ${permitNo}`].filter(Boolean).join(' / '),
        _extra: { source, ward, permit_no: permitNo, name, address, permit_date: permitDate, business_type: businessType, raw },
    };
};

/** Newest `limit` 許可 rows of one source; 届出 rows are not an opening signal and are skipped. */
const fetchSource = async (source: Source, limit: number): Promise<Array<DataItem & { _extra: PermitExtra }>> => {
    try {
        const rows = source === 'shibuya' ? await fetchShibuya() : await fetchMinato();
        return rows
            .filter((r) => (r['許可番号'] ?? '') !== '' && (r['許可あるいは届出'] ?? '許可') === '許可')
            .map((raw) => toItem(source, raw))
            .filter((it) => it._extra.permit_date !== null)
            .toSorted((a, b) => b._extra.permit_date!.localeCompare(a._extra.permit_date!))
            .slice(0, limit);
    } catch (error) {
        // One failing publisher must not take the whole feed down.
        logger.warn(`lg/tokyo/food-permit: ${source} failed: ${String(error)}`);
        return [];
    }
};

export const handler = async (ctx): Promise<Data> => {
    const ward: string | undefined = ctx.req.param('ward');
    const sources: Source[] = ward === undefined ? (Object.keys(SOURCES) as Source[]) : Object.hasOwn(SOURCES, ward) ? [ward as Source] : [];
    if (sources.length === 0) {
        throw new Error(`Unknown ward "${ward}", expected one of ${Object.keys(SOURCES).join(', ')}`);
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : DEFAULT_LIMIT, MAX_LIMIT);

    const lists = await Promise.all(sources.map((s) => cache.tryGet(`lg/tokyo/food-permit:${s}:${limit}`, () => fetchSource(s, limit)) as Promise<Array<DataItem & { _extra: PermitExtra }>>));
    const items = lists.flat().toSorted((a, b) => (b._extra.permit_date ?? '').localeCompare(a._extra.permit_date ?? ''));

    return {
        title: `東京都 飲食店営業許可 新規${ward ? ` (${SOURCES[ward as Source].label})` : ''}`,
        link: 'https://catalog.data.metro.tokyo.lg.jp/',
        language: 'ja',
        item: items,
        allowEmpty: true,
    };
};

export const route: Route = {
    path: '/tokyo/food-permit/:ward?',
    name: '東京都 飲食店営業許可 新規',
    url: 'catalog.data.metro.tokyo.lg.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/lg/tokyo/food-permit',
    parameters: {
        ward: {
            description: 'Ward; omit for all sources',
            options: [
                { value: 'shibuya', label: '渋谷区' },
                { value: 'minato', label: '港区' },
            ],
        },
    },
    description: `Newly granted food business permits (飲食店営業許可 etc.) in Tokyo wards, from each ward's CC BY open data:

- 渋谷区: [食品営業許可施設一覧 (ArcGIS FeatureServer)](https://city-shibuya-data.opendata.arcgis.com/items/e68f41ebfa5f4ea490ca9af701d44e02) — current and previous month
- 港区: [食品営業許可一覧 (CSV)](https://catalog.data.metro.tokyo.lg.jp/dataset/t131032d0000000244) — monthly snapshot of valid permits, newest first

Items are sorted by permit date (\`pubDate\`). \`_extra\` holds \`source\`, \`ward\`, \`permit_no\`, \`name\`, \`address\`, \`permit_date\`, \`business_type\` and the publisher's original columns in \`raw\`. Only 許可 rows are included (届出 rows are skipped).

| Query   | Description                           | Default |
| ------- | ------------------------------------- | ------- |
| \`limit\` | Number of permits per source, max 500 | 100     |`,
    categories: ['government'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
    },
};
