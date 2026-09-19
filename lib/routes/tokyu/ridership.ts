import { load } from 'cheerio';

import type { RidershipExtra } from '@/routes/tokyometro/utils';
import { cellText, parseCount, parseFiscalYear, parsePct, ridershipItem } from '@/routes/tokyometro/utils';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const BASE = 'https://www.tokyu.co.jp/railway/company/business/passengers/';
const OPERATOR = '東急電鉄';

/**
 * 駅別乗降人員・輸送人員 — the index lists one page per fiscal year (`2014/` … `2025/`).
 * A year page has one `table.table` per line, preceded by `.portal-heading h2` (line name):
 *   駅名＼種別 | 定期(人) | 定期外(人) | 計(人) | 前年比(％) | <previous year>年度
 * Columns are located by header text. 世田谷線 only has a 全線 row (no per-station figures), which is skipped.
 */
const parsePage = (html: string, link: string): { fiscalYear: number; items: Array<ReturnType<typeof ridershipItem>> } => {
    const $ = load(html);
    const fiscalYear = parseFiscalYear($('title').text());
    if (fiscalYear === null) {
        throw new Error('tokyu: fiscal year not found in the page title');
    }

    const items = $('table.table')
        .toArray()
        .flatMap((table) => {
            const line = cellText($(table).closest('.portal-table').prevAll('.portal-heading').first().find('h2').text()) || null;
            const headers = $(table)
                .find('thead th')
                .toArray()
                .map((th) => cellText($(th).text()));
            const col = (re: RegExp): number => headers.findIndex((h) => re.test(h));
            const [iCommuter, iOther, iTotal, iYoy, iPrev] = [/^定期\(/, /^定期外/, /^計/, /^前年比/, /年度$/].map(col);
            if (iTotal < 0) {
                return [];
            }
            return $(table)
                .find('tbody tr')
                .toArray()
                .map((tr) => {
                    const station = cellText($(tr).find('th').first().text());
                    const tds = $(tr)
                        .find('td')
                        .toArray()
                        .map((td) => cellText($(td).text()));
                    // <th> is column 0 of the header, so <td> index = header index - 1.
                    const at = (i: number): string => (i > 0 ? (tds[i - 1] ?? '') : '');
                    if (station === '' || station === '全線') {
                        return null;
                    }
                    const raw: RidershipExtra['raw'] = {
                        station,
                        commuter_pass: at(iCommuter),
                        non_commuter: at(iOther),
                        total: at(iTotal),
                        yoy: at(iYoy),
                        [headers[iPrev] ?? 'previous_year']: at(iPrev),
                    };
                    const extra: RidershipExtra = {
                        source: 'tokyu',
                        operator: OPERATOR,
                        station,
                        line,
                        fiscal_year: fiscalYear,
                        daily_average: parseCount(raw.total),
                        unit: '人/日',
                        measure: 'boarding_alighting',
                        rank: null,
                        yoy_pct: parsePct(raw.yoy),
                        raw,
                    };
                    return ridershipItem(extra, link);
                })
                .filter((item): item is ReturnType<typeof ridershipItem> => item !== null);
        });
    return { fiscalYear, items };
};

/** Latest year = the largest `passengers/<year>/` link on the index page. */
const latestYear = async (): Promise<number> => {
    const html = await ofetch(BASE);
    const $ = load(html);
    const years = $('a[href*="/passengers/"]')
        .toArray()
        .map((a) => Number(($(a).attr('href') ?? '').match(/\/passengers\/(\d{4})\/?$/)?.[1]))
        .filter((y) => Number.isSafeInteger(y));
    if (years.length === 0) {
        throw new Error('tokyu: no fiscal-year pages linked from the index');
    }
    return Math.max(...years);
};

export const handler = async (ctx): Promise<Data> => {
    const year: string | undefined = ctx.req.param('year');
    const fy = year === undefined ? ((await cache.tryGet('tokyu/ridership:latest', latestYear)) as number) : Number(year);
    if (!Number.isSafeInteger(fy)) {
        throw new TypeError(`tokyu: invalid year "${year}"`);
    }
    const link = `${BASE}${fy}/`;
    const page = (await cache.tryGet(link, async () => parsePage(await ofetch(link), link))) as ReturnType<typeof parsePage>;

    return {
        title: `東急電鉄 ${page.fiscalYear}年度 駅別乗降人員`,
        link,
        language: 'ja',
        item: page.items,
    };
};

export const route: Route = {
    path: '/ridership/:year?',
    name: '駅別乗降人員',
    url: 'www.tokyu.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/tokyu/ridership',
    parameters: {
        year: {
            description: 'Fiscal year (`2014` … latest); omit for the latest year',
        },
    },
    description: `Annual 駅別乗降人員 (one-day average) for every Tokyu station, from [駅別乗降人員・輸送人員](${BASE}). One item per station, line and fiscal year (渋谷, 日吉, 蒲田 … appear once per line, as on the page); \`_extra\` carries \`operator\`, \`station\`, \`line\`, \`fiscal_year\`, \`daily_average\` (計, 人/日), \`yoy_pct\` and the page's cell text in \`raw\` (定期 / 定期外 / 計 / 前年比 / previous-year figure). \`rank\` is \`null\` because the operator publishes no ranking. 世田谷線 is published as a single 全線 figure and is not included. The operator does not publish a release date, so items have no \`pubDate\`.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.tokyu.co.jp/railway/company/business/passengers/:year', 'www.tokyu.co.jp/railway/company/business/passengers/'],
            target: '/ridership/:year',
        },
    ],
};
