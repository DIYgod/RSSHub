import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { csvRecords, decodeText, type PermitExtra, type Row } from '../utils';

/**
 * 食品営業許可 facilities of 大阪市, from the CC BY 4.0 CSV linked on the city's 食品営業許可施設一覧 page
 * (https://www.city.osaka.lg.jp/kenko/page/0000575579.html). The file is a quarterly snapshot of every valid permit
 * (~64k rows, ~10 MB, Shift_JIS) with 屋号 / 業種分類 / 営業所所在地 / 緯度経度 / 指令番号 / 申請区分 / 許可満了日 — there is
 * no permit date, so items carry no `pubDate` and are ordered by 指令番号 (`大 保食第<年度>-<連番>号`, newest first).
 * The file name carries its extraction date (`260630zenku.csv`), so the page is scraped for the current link.
 */

const PAGE = 'https://www.city.osaka.lg.jp/kenko/page/0000575579.html';
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

/** `大 保食第24-8092号` → `[24, 8092]`; anything else → null. */
const permitKey = (no: string): [number, number] | null => {
    const m = /第(\d+)[-－](\d+)号?$/.exec(no.normalize('NFKC').replaceAll(/\s/g, ''));
    return m ? [Number(m[1]), Number(m[2])] : null;
};

const toNumber = (v: string | null | undefined): number | null => {
    const n = v ? Number(v.trim()) : NaN;
    return Number.isFinite(n) ? n : null;
};

/** The publisher's 経度 / 緯度 columns have been swapped in past releases, so the pair is ordered by value (in Japan lon > lat). */
const coords = (raw: Row): { lat: number | null; lon: number | null } => {
    const a = toNumber(raw['緯度']);
    const b = toNumber(raw['経度']);
    if (a === null || b === null) {
        return { lat: null, lon: null };
    }
    return a > b ? { lat: b, lon: a } : { lat: a, lon: b };
};

const fetchRows = async (): Promise<Row[]> => {
    const html: string = await ofetch(PAGE, { responseType: 'text' });
    const $ = load(html);
    const href = $('a[href$=".csv"]')
        .toArray()
        .map((a) => $(a).attr('href')!)
        .find((h) => h.includes('city.osaka.lg.jp'));
    if (!href) {
        throw new Error('lg/osaka/food-permit: no CSV link on the 食品営業許可施設一覧 page');
    }
    const buf: ArrayBuffer = await ofetch(new URL(href, PAGE).href, { responseType: 'arrayBuffer' });
    return csvRecords(decodeText(buf));
};

const toItem = (raw: Row): DataItem & { _extra: PermitExtra } => {
    const permitNo = raw['指令番号']!.trim();
    const name = raw['屋号']?.trim() || '(名称なし)';
    const address = raw['営業所所在地']?.trim() || null;
    const businessType = raw['業種分類']?.trim() || null;
    const ward = /^(\S+?区)/.exec(address ?? '')?.[1] ?? '大阪市';
    const { lat, lon } = coords(raw);
    return {
        title: `${name}（${businessType ?? '業種不明'}）`,
        guid: `lg/osaka/food-permit:${permitNo}`,
        link: PAGE,
        description: [ward, address, businessType, `指令番号 ${permitNo}`, raw['許可満了日'] ? `許可満了日 ${raw['許可満了日']}` : null].filter(Boolean).join(' / '),
        _extra: { source: 'osaka', ward, permit_no: permitNo, name, address, permit_date: null, business_type: businessType, lat, lon, raw },
    };
};

/** Newest `limit` 新規 permits (更新 rows are renewals, not openings), by 指令番号. */
const fetchItems = async (limit: number): Promise<Array<DataItem & { _extra: PermitExtra }>> => {
    const rows = await fetchRows();
    return rows
        .filter((r) => (r['指令番号'] ?? '').trim() !== '' && (r['申請区分'] ?? '新規') === '新規')
        .map((raw) => ({ raw, key: permitKey(raw['指令番号']!) }))
        .filter((r): r is { raw: Row; key: [number, number] } => r.key !== null)
        .toSorted((a, b) => b.key[0] - a.key[0] || b.key[1] - a.key[1])
        .slice(0, limit)
        .map((r) => toItem(r.raw));
};

export const handler = async (ctx): Promise<Data> => {
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : DEFAULT_LIMIT, MAX_LIMIT);
    const items = (await cache.tryGet(`lg/osaka/food-permit:${limit}`, () => fetchItems(limit))) as Array<DataItem & { _extra: PermitExtra }>;
    return {
        title: '大阪市 食品営業許可 新規',
        link: PAGE,
        language: 'ja',
        item: items,
        allowEmpty: true,
    };
};

export const route: Route = {
    path: '/osaka/food-permit',
    name: '大阪市 食品営業許可 新規',
    url: 'www.city.osaka.lg.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/lg/osaka/food-permit',
    description: `Newest food business permits (食品営業許可) in 大阪市，from the CC BY 4.0 [食品営業許可施設一覧 CSV](https://www.city.osaka.lg.jp/kenko/page/0000575579.html) — a quarterly snapshot of all valid permits with 緯度経度.

The dataset has no permit date, only 許可満了日，so items have no \`pubDate\`; they are ordered by 指令番号 (\`大 保食第<年度>-<連番>号\`), newest first, and only 申請区分 = 新規 rows are included. \`_extra\` holds \`source\`, \`ward\`, \`permit_no\`, \`name\`, \`address\`, \`permit_date\` (always \`null\`), \`business_type\`, \`lat\`, \`lon\` and the publisher's original columns in \`raw\`.

| Query   | Description                | Default |
| ------- | -------------------------- | ------- |
| \`limit\` | Number of permits, max 500 | 100     |`,
    categories: ['government'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
    },
};
