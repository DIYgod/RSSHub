import { load } from 'cheerio';
import pMap from 'p-map';

import type { RidershipExtra } from '@/routes/tokyometro/utils';
import { cellText, parseCount, parseFiscalYear, parsePct, ridershipItem } from '@/routes/tokyometro/utils';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const HOST = 'https://www.jreast.co.jp';
const LATEST = `${HOST}/company/data/passenger/`;
const OPERATOR = 'JR東日本';
const MAX_SUBPAGES = 9;

/** The site's WAF rejects requests that do not look like a browser navigation. */
const BROWSER_HEADERS = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'ja,en;q=0.8',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
};

const fetchPage = (url: string): Promise<string> => ofetch(url, { headers: BROWSER_HEADERS, responseType: 'text' });

/** null on 404 (the 101位以下 sequence and older-year URLs end that way). */
const fetchOptional = async (url: string): Promise<string | null> => {
    try {
        return await fetchPage(url);
    } catch {
        return null;
    }
};

/**
 * `table.passengerTable` rows. ベスト100 page: 順位 | 駅名 | 定期外 | 定期 | 合計 | 前年度比; 101位以下 pages
 * (`{year}_01.html` …): 駅名 | 定期外 | 定期 | 合計 with no rank, so the rank is computed from the position.
 * 前年度比 is a ratio (102.5) from FY2023 on and a % change (△ 38.5) before that.
 */
const parseStations = (html: string, fiscalYear: number, firstRank: number): Array<ReturnType<typeof ridershipItem>> => {
    const $ = load(html);
    const rows = $('table.passengerTable tr')
        .toArray()
        .map((tr) => ({
            cells: $(tr)
                .find('td')
                .toArray()
                .map((td) => cellText($(td).text())),
            link: $(tr).find('td.stationName a').attr('href'),
        }))
        .filter((r) => r.cells.length >= 4);
    return rows.map((r, index) => {
        const ranked = r.cells.length >= 6;
        const [rankText, station, nonCommuter, commuter, total, yoyText] = ranked ? r.cells : ['', ...r.cells, ''];
        const yoy = parsePct(yoyText);
        const raw: RidershipExtra['raw'] = { rank: rankText, station, non_commuter: nonCommuter, commuter, total, yoy: yoyText };
        const extra: RidershipExtra = {
            source: 'jreast',
            operator: OPERATOR,
            station,
            line: null,
            fiscal_year: fiscalYear,
            daily_average: parseCount(total),
            unit: '人/日',
            measure: 'boarding',
            rank: ranked ? parseCount(rankText) : firstRank + index,
            // A ratio above 50 (e.g. 102.5) means "% of the previous year"; anything else is already a % change.
            yoy_pct: yoy === null ? null : yoy > 50 ? Math.round((yoy - 100) * 10) / 10 : yoy,
            raw,
        };
        return ridershipItem(extra, r.link ?? `${HOST}/company/data/passenger/`);
    });
};

const fetchYear = async (indexHtml: string, indexUrl: string) => {
    const heading = load(indexHtml)('h1').first().text();
    const fiscalYear = parseFiscalYear(heading);
    if (fiscalYear === null) {
        throw new Error('jreast: fiscal year not found in the page heading');
    }
    const year = fiscalYear;
    const items = parseStations(indexHtml, fiscalYear, 1);
    // 101位以下: {year}_01.html … in the same directory; a missing page (404) or an empty one ends the sequence.
    const dir = indexUrl.slice(0, indexUrl.lastIndexOf('/') + 1);
    const subpages = await pMap(
        Array.from({ length: MAX_SUBPAGES }, (_, i) => `${dir}${year}_${String(i + 1).padStart(2, '0')}.html`),
        (url) => fetchOptional(url),
        { concurrency: 2 }
    );
    for (const html of subpages) {
        const page = html === null ? [] : parseStations(html, fiscalYear, items.length + 1);
        if (page.length === 0) {
            break;
        }
        items.push(...page);
    }
    return { fiscalYear, items };
};

/** Latest year lives at `/company/data/passenger/`; earlier years at `{year}.html` there (FY2023) or under `/passenger/` (FY2022 and before). */
const resolveYearPage = async (year: string | undefined): Promise<{ link: string; html: string }> => {
    const candidates = year === undefined ? [LATEST] : [`${LATEST}${year}.html`, `${HOST}/passenger/${year}.html`];
    for (const link of candidates) {
        // eslint-disable-next-line no-await-in-loop -- the second URL is only tried when the first is missing
        const html = await fetchOptional(link);
        if (html !== null) {
            return { link, html };
        }
    }
    throw new Error(`jreast: FY${year} is not published`);
};

export const handler = async (ctx): Promise<Data> => {
    const yearParam: string | undefined = ctx.req.param('year');
    const page = (await cache.tryGet(`jreast/ridership:${yearParam ?? 'latest'}`, async () => {
        const { link, html } = await resolveYearPage(yearParam);
        return { link, ...(await fetchYear(html, link)) };
    })) as { link: string; fiscalYear: number; items: Array<ReturnType<typeof ridershipItem>> };
    const link = page.link;

    return {
        title: `JR東日本 各駅の乗車人員（${page.fiscalYear}年度一日平均）`,
        link,
        language: 'ja',
        item: page.items,
    };
};

export const route: Route = {
    path: '/ridership/:year?',
    name: '各駅の乗車人員',
    url: 'www.jreast.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/jreast/ridership',
    parameters: {
        year: {
            description: 'Fiscal year (`2019` … latest); omit for the latest year',
        },
    },
    description: `Annual 各駅の乗車人員 (one-day average of boarding passengers) for every JR東日本 station, from [各駅の乗車人員](${HOST}/company/data/passenger/) (ベスト100 plus the 101位以下 pages). One item per station and fiscal year; \`_extra\` follows the shared ridership shape with \`measure: 'boarding'\` — JR東日本 counts 乗車 only, so the figures are not comparable with the 乗降 figures of other operators. \`yoy_pct\` is normalised to a % change (the site prints a ratio such as 102.5 from FY2023 on). The operator does not publish a release date, so items have no \`pubDate\`.

::: warning
The site's [ご利用にあたって](${HOST}/site/rules.html) states: 「当サイト上に掲載されている全ての写真、社名ロゴ、画像、文章等のデータ等の利用については、複製・転用・転載・電磁的加工・送信・頒布・二次的使用・その他これらに類する全ての行為も含め、一切お断りいたします。」 Use the figures accordingly.
:::`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.jreast.co.jp/company/data/passenger/', 'www.jreast.co.jp/passenger/'],
            target: '/ridership',
        },
    ],
};
