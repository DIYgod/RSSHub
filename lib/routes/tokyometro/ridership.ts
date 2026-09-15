import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { RidershipExtra } from './utils';
import { cellText, parseCount, parseFiscalYear, parsePct, ridershipItem } from './utils';

const BASE = 'https://www.tokyometro.jp/corporate/enterprise/passenger_rail/transportation/passengers/';
const OPERATOR = '東京メトロ';

/**
 * 各駅の乗降人員ランキング — one page per fiscal year (index.html = latest, `2024.html` …), linked from `ul.v2_linkTab`.
 * Two station tables, both `table.v2_table`, distinguished by their `summary`:
 *   駅別乗降人員順位表:   順位 | 路線 (one <img alt> per line) | 駅名 | 人員 | 前年比
 *   直通連絡駅・共用駅:    線名 | 駅名 | 人員 | 前年比   (no rank — these stations are counted by the partner railway)
 * The third table (総駅数) is not station data. 前年比 uses ▲ for a decrease.
 */
const parsePage = (html: string, link: string): { fiscalYear: number; items: Array<ReturnType<typeof ridershipItem>>; years: Record<string, string> } => {
    const $ = load(html);
    const fiscalYear = parseFiscalYear($('h3').first().text());
    if (fiscalYear === null) {
        throw new Error('tokyometro: fiscal year not found in the page heading');
    }
    const years = Object.fromEntries(
        $('ul.v2_linkTab a')
            .toArray()
            .map((a) => [String(parseFiscalYear($(a).text())), $(a).attr('href') ?? ''])
            .filter(([y, href]) => y !== 'null' && href !== '')
    );

    const items = $('table.v2_table')
        .toArray()
        .flatMap((table) => {
            const summary = $(table).attr('summary') ?? '';
            const ranked = summary.includes('順位表') && !summary.includes('総駅数');
            const through = summary.includes('直通連絡駅');
            if (!ranked && !through) {
                return [];
            }
            return $(table)
                .find('tr')
                .toArray()
                .map((tr) => {
                    const cells = $(tr).find('td').toArray();
                    // ranked: [順位, 路線, 駅名, 人員, 前年比]; through: [線名, 駅名, 人員, 前年比]
                    const [rankCell, lineCell, stationCell, countCell, yoyCell] = ranked ? cells : [undefined, ...cells];
                    if (!stationCell || !countCell) {
                        return null;
                    }
                    const lines = $(lineCell)
                        .find('img')
                        .toArray()
                        .map((img) => cellText($(img).attr('alt')))
                        .filter(Boolean);
                    const raw: RidershipExtra['raw'] = {
                        table: through ? '他鉄道との直通連絡駅および共用している駅' : '駅別乗降人員順位表',
                        rank: rankCell ? cellText($(rankCell).text()) : '',
                        lines: lines.join(' '),
                        station: cellText($(stationCell).text()),
                        passengers: cellText($(countCell).text()),
                        yoy: cellText($(yoyCell).text()),
                    };
                    if (raw.station === '') {
                        return null;
                    }
                    const extra: RidershipExtra = {
                        source: 'tokyometro',
                        operator: OPERATOR,
                        station: raw.station,
                        line: lines.length > 0 ? lines.join('・') : null,
                        fiscal_year: fiscalYear,
                        daily_average: parseCount(raw.passengers),
                        unit: '人/日',
                        measure: 'boarding_alighting',
                        rank: rankCell ? parseCount(raw.rank) : null,
                        yoy_pct: parsePct(raw.yoy),
                        raw,
                    };
                    return ridershipItem(extra, link);
                })
                .filter((item): item is ReturnType<typeof ridershipItem> => item !== null);
        });
    return { fiscalYear, items, years };
};

export const handler = async (ctx): Promise<Data> => {
    const year: string | undefined = ctx.req.param('year');
    const indexLink = `${BASE}index.html`;
    const latest = (await cache.tryGet(indexLink, async () => parsePage(await ofetch(indexLink), indexLink))) as ReturnType<typeof parsePage>;

    let page = latest;
    let link = indexLink;
    if (year !== undefined && Number(year) !== latest.fiscalYear) {
        const href = latest.years[year];
        if (!href) {
            throw new Error(`tokyometro: FY${year} is not published; available: ${Object.keys(latest.years).join(', ')}`);
        }
        link = new URL(href, BASE).href;
        page = (await cache.tryGet(link, async () => parsePage(await ofetch(link), link))) as ReturnType<typeof parsePage>;
    }

    return {
        title: `東京メトロ 各駅の乗降人員ランキング（${page.fiscalYear}年度一日平均）`,
        link,
        language: 'ja',
        item: page.items,
    };
};

export const route: Route = {
    path: '/ridership/:year?',
    name: '各駅の乗降人員ランキング',
    url: 'www.tokyometro.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/tokyometro/ridership',
    parameters: {
        year: {
            description: 'Fiscal year (`2020` … latest); omit for the latest year',
        },
    },
    description: `Annual 駅別乗降人員 (one-day average) for every Tokyo Metro station, from [各駅の乗降人員ランキング](${BASE}index.html). One item per station and fiscal year; \`_extra\` carries \`operator\`, \`station\`, \`line\` (several lines joined with \`・\`), \`fiscal_year\`, \`daily_average\` (人/日), \`rank\`, \`yoy_pct\` and the page's cell text in \`raw\`. Stations in the 直通連絡駅・共用駅 table (渋谷, 北千住, 中目黒, …) have no rank because the operator does not rank them. 国会議事堂前 and 溜池山王 are listed as one station (国会・溜池), as on the page. The operator does not publish a release date, so items have no \`pubDate\`.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.tokyometro.jp/corporate/enterprise/passenger_rail/transportation/passengers/:page'],
            target: '/ridership',
        },
    ],
};
