import { type CheerioAPI, load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { csvRecords, decodeText, isoDate, type PermitExtra, type Row, warekiMonth } from '../utils';

export type { PermitExtra } from '../utils';

/**
 * 飲食店営業許可 (food business permits) newly granted in Tokyo wards, from each ward's CC BY open data.
 *
 * Six of the 23 wards publish a machine-readable, regularly updated 台帳 (surveyed 2026-09-15):
 *   shibuya   — 渋谷区 ArcGIS FeatureServer (complete ledger incl. 廃業; the current and previous month are queried)
 *   minato    — 港区 自治体標準オープンデータ CSV (snapshot of valid permits, monthly, ~2 MB)
 *   taito     — 台東区 monthly 新規許可 CSV linked from the 食品衛生営業施設一覧 page (CC BY via the 東京都 catalog)
 *   shinagawa — 品川区 monthly 許可施設一覧 CSV linked from the 食品衛生許可施設一覧 page (CC BY 4.0; individuals' names masked with ※)
 *   setagaya  — 世田谷区 monthly 新規許可施設一覧 CSV linked from the 食品関係施設情報 page (CC BY 4.0)
 *   meguro    — 目黒区 monthly 飲食店 新規 CSV from the BODIK CKAN dataset (CC BY 4.0)
 * For the page-linked wards the two newest monthly files are read. Rows are the publisher's original columns,
 * exposed verbatim in `_extra.raw`; 中央 / 江東 / 新宿 / 中野 also have CC BY CSVs on the catalog but they are
 * snapshots frozen in 2022–2023, so they are not included.
 */

type Source = 'shibuya' | 'minato' | 'taito' | 'shinagawa' | 'setagaya' | 'meguro';

const SOURCES: Record<Source, { label: string; link: string }> = {
    shibuya: {
        label: '渋谷区',
        link: 'https://city-shibuya-data.opendata.arcgis.com/items/e68f41ebfa5f4ea490ca9af701d44e02',
    },
    minato: {
        label: '港区',
        link: 'https://catalog.data.metro.tokyo.lg.jp/dataset/t131032d0000000244',
    },
    taito: {
        label: '台東区',
        link: 'https://www.city.taito.lg.jp/kenkohukusi/kenkokikikanrieisei/food/syokuhin-sisetu/index.html',
    },
    shinagawa: {
        label: '品川区',
        link: 'https://www.city.shinagawa.tokyo.jp/PC/kenkou/kenkou-eisei/kenkou-eisei-syokuhin/opendate.html',
    },
    setagaya: {
        label: '世田谷区',
        link: 'https://www.city.setagaya.lg.jp/02245/online_tetsuzuki/3246.html',
    },
    meguro: {
        label: '目黒区',
        link: 'https://data.bodik.jp/dataset/131105_food_business',
    },
};
const MEGURO_API = 'https://data.bodik.jp/api/3/action/package_show?id=131105_food_business';
const MONTHS_BACK = 2;
const SHIBUYA_QUERY = 'https://services3.arcgis.com/UtdeFTavkHfI94t2/arcgis/rest/services/131130_food_businesses_list/FeatureServer/0/query';
const SHIBUYA_DATE = '許可開始日もしくは届出受理日';
const MINATO_CSV = 'https://opendata.city.minato.tokyo.jp/dataset/54d8c582-00e2-4730-a23f-4a5befec9ae5/resource/c9d0299e-8e05-4317-877f-83055709e41f/download/food_business_all.csv';
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const DATE_COLS = ['許可年月日', '許可決定日', SHIBUYA_DATE, '許可開始日', '許可日'];

/** First non-empty column; `※` / `※※※※※` (品川区・台東区 mask individuals' data this way) counts as empty. */
const pick = (row: Row, cols: readonly string[]): string | null => {
    for (const c of cols) {
        const v = row[c]?.trim();
        if (v && !/^[※＊*]+$/.test(v)) {
            return v;
        }
    }
    return null;
};

const toNumber = (v: string | null): number | null => {
    const n = v === null ? NaN : Number(v.trim());
    return Number.isFinite(n) ? n : null;
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

const fetchCsv = async (url: string): Promise<Row[]> => {
    const buf: ArrayBuffer = await ofetch(url, { responseType: 'arrayBuffer' });
    return csvRecords(decodeText(buf));
};

/** The newest `MONTHS_BACK` monthly files of a page-linked ward, in the order given (newest first), concatenated. */
const fetchMonthly = async (urls: string[]): Promise<Row[]> => (await Promise.all(urls.slice(0, MONTHS_BACK).map((u) => fetchCsv(u)))).flat();

/** Link `href`s with a sortable key, newest first. */
const newestLinks = ($: CheerioAPI, base: string, keyOf: (text: string, href: string) => string | null): string[] =>
    $('a[href$=".csv"]')
        .toArray()
        .map((a) => ({ href: new URL($(a).attr('href')!, base).href, key: keyOf($(a).text(), $(a).attr('href')!) }))
        .filter((l): l is { href: string; key: string } => l.key !== null)
        .toSorted((a, b) => b.key.localeCompare(a.key))
        .map((l) => l.href);

/** 台東区: the 月別 table lists each month as 業種順 + 許可日順 (same rows); the file names are not regular (`2026-07-PER-CSV.csv`, `OPD08_PER.csv`), so rows are taken in table order. */
const fetchTaito = async (): Promise<Row[]> => {
    const html: string = await ofetch(SOURCES.taito.link, { responseType: 'text' });
    const $ = load(html);
    const table = $('table').filter((_, t) => $(t).find('caption').text().includes('月別'));
    const urls = table
        .find('a[href$=".csv"]')
        .toArray()
        .filter((a) => $(a).text().includes('許可日順'))
        .map((a) => new URL($(a).attr('href')!, SOURCES.taito.link).href)
        .toReversed();
    return fetchMonthly(urls);
};

/** 品川区: `令和8年7月分許可施設一覧` links (the 令和6〜7年度 yearly file is skipped). */
const fetchShinagawa = async (): Promise<Row[]> => {
    const html: string = await ofetch(SOURCES.shinagawa.link, { responseType: 'text' });
    const $ = load(html);
    return fetchMonthly(newestLinks($, SOURCES.shinagawa.link, (text) => (text.includes('月分') ? warekiMonth(text) : null)));
};

/** 世田谷区: `例月新規許可施設一覧(R080831)` links, keyed by the R+YYMMDD code (the yearly 全件 file has none). */
const fetchSetagaya = async (): Promise<Row[]> => {
    const html: string = await ofetch(SOURCES.setagaya.link, { responseType: 'text' });
    const $ = load(html);
    return fetchMonthly(newestLinks($, SOURCES.setagaya.link, (text) => /例月新規許可施設一覧\(R(\d{6})\)/.exec(text)?.[1] ?? null));
};

/** 目黒区: CKAN resources named `飲食店 新規 令和７年１０月分` (or `新規飲食店施設一覧 …`); 更新 / 届出 / 廃業 files are skipped. */
const fetchMeguro = async (): Promise<Row[]> => {
    const body = await ofetch(MEGURO_API);
    const resources: Array<{ name: string; url: string; format: string }> = body?.result?.resources ?? [];
    const urls = resources
        .filter((r) => r.format.toUpperCase() === 'CSV' && r.name.includes('飲食店') && r.name.includes('新規'))
        .map((r) => ({ url: r.url, key: warekiMonth(r.name) }))
        .filter((r): r is { url: string; key: string } => r.key !== null)
        .toSorted((a, b) => b.key.localeCompare(a.key))
        .map((r) => r.url);
    return fetchMonthly(urls);
};

const FETCHERS: Record<Source, () => Promise<Row[]>> = {
    shibuya: fetchShibuya,
    minato: fetchMinato,
    taito: fetchTaito,
    shinagawa: fetchShinagawa,
    setagaya: fetchSetagaya,
    meguro: fetchMeguro,
};

const toItem = (source: Source, raw: Row): DataItem & { _extra: PermitExtra } => {
    const permitNo = pick(raw, ['許可番号']) ?? '';
    const name = pick(raw, ['施設名称', '屋号', '施設屋号', '施設の名称']) ?? '(名称なし)';
    const address = pick(raw, ['所在地_連結表記', '施設所在地_連結表記', '施設所在地', '営業所所在地', '営業施設所在地']);
    const permitDate = isoDate(pick(raw, DATE_COLS));
    const businessType = pick(raw, ['営業の種類', '営業の種類もしくは営業の形態', '業種']);
    const ward = (pick(raw, ['施設所在地_市区町村', '地方公共団体名']) ?? SOURCES[source].label).replace(/^東京都/, '');
    const lat = toNumber(pick(raw, ['緯度']));
    const lon = toNumber(pick(raw, ['経度']));
    return {
        title: `${name}（${businessType ?? '業種不明'}）`,
        guid: `lg/tokyo/food-permit:${source}:${permitNo}`,
        link: SOURCES[source].link,
        pubDate: permitDate === null ? undefined : timezone(parseDate(permitDate, 'YYYY-MM-DD'), 9),
        description: [ward, address, businessType, permitDate, `許可番号 ${permitNo}`].filter(Boolean).join(' / '),
        _extra: { source, ward, permit_no: permitNo, name, address, permit_date: permitDate, business_type: businessType, lat, lon, raw },
    };
};

/** Newest `limit` 許可 rows of one source; 届出 rows are not an opening signal and are skipped. */
const fetchSource = async (source: Source, limit: number): Promise<Array<DataItem & { _extra: PermitExtra }>> => {
    try {
        const rows = await FETCHERS[source]();
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
                { value: 'taito', label: '台東区' },
                { value: 'shinagawa', label: '品川区' },
                { value: 'setagaya', label: '世田谷区' },
                { value: 'meguro', label: '目黒区' },
            ],
        },
    },
    description: `Newly granted food business permits (飲食店営業許可 etc.) in Tokyo wards, from each ward's CC BY open data:

- 渋谷区: [食品営業許可施設一覧 (ArcGIS FeatureServer)](https://city-shibuya-data.opendata.arcgis.com/items/e68f41ebfa5f4ea490ca9af701d44e02) — current and previous month
- 港区: [食品営業許可一覧 (CSV)](https://catalog.data.metro.tokyo.lg.jp/dataset/t131032d0000000244) — monthly snapshot of valid permits, newest first
- 台東区: [食品衛生営業施設一覧](https://www.city.taito.lg.jp/kenkohukusi/kenkokikikanrieisei/food/syokuhin-sisetu/index.html) — the two newest monthly 新規許可 CSVs (updated on the 10th)
- 品川区: [食品衛生許可施設一覧](https://www.city.shinagawa.tokyo.jp/PC/kenkou/kenkou-eisei/kenkou-eisei-syokuhin/opendate.html) — the two newest monthly CSVs (updated on the 15th); individuals' names and addresses are masked by the publisher and come through as \`null\`
- 世田谷区: [食品関係施設情報の公開について](https://www.city.setagaya.lg.jp/02245/online_tetsuzuki/3246.html) — the two newest 例月新規許可施設一覧 CSVs (updated on the 15th)
- 目黒区: [飲食店等 (BODIK CKAN)](https://data.bodik.jp/dataset/131105_food_business) — the two newest 飲食店 新規 monthly CSVs (updated by the 10th)

Items are sorted by permit date (\`pubDate\`). \`_extra\` holds \`source\`, \`ward\`, \`permit_no\`, \`name\`, \`address\`, \`permit_date\`, \`business_type\`, \`lat\` / \`lon\` (when the publisher gives them, else \`null\`) and the publisher's original columns in \`raw\`. Only 許可 rows are included (届出 rows are skipped).

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
