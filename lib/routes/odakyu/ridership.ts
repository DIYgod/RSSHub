import { load } from 'cheerio';

import type { RidershipExtra } from '@/routes/tokyometro/utils';
import { cellText, parseCount, parseFiscalYear, parsePct, ridershipItem } from '@/routes/tokyometro/utils';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const LINK = 'https://www.odakyu.jp/company/railroad/users/';
const OPERATOR = '小田急電鉄';

/**
 * 鉄道部門：駅別乗降人員・輸送人員ほか — a single page for the current fiscal year (`p.note` "データは2025年度のものです。").
 * Section 1日平均駅別乗降人員 has one `table.table--s` per line, each under `div.h3 > h3#line-N` (小田原線 / 江ノ島線 / 多摩線):
 *   駅名 (th) | 人 | 増減率（パーセント） | 順位
 * Other sections (輸送人員の推移 …) are images, not tables.
 */
const parsePage = (html: string): { fiscalYear: number; items: Array<ReturnType<typeof ridershipItem>> } => {
    const $ = load(html);
    const fiscalYear = parseFiscalYear($('p.note').text());
    if (fiscalYear === null) {
        throw new Error('odakyu: fiscal year not found in the page note');
    }

    const items = $('table')
        .toArray()
        .flatMap((table) => {
            const headers = $(table)
                .find('tr')
                .first()
                .find('th')
                .toArray()
                .map((th) => cellText($(th).text()));
            if (headers[0] !== '駅名') {
                return [];
            }
            const line = cellText($(table).closest('.section-s').prev().find('h3').text()) || null;
            return $(table)
                .find('tr')
                .slice(1)
                .toArray()
                .map((tr) => {
                    const station = cellText($(tr).find('th').first().text());
                    const [count = '', yoy = '', rank = ''] = $(tr)
                        .find('td')
                        .toArray()
                        .map((td) => cellText($(td).text()));
                    if (station === '') {
                        return null;
                    }
                    const raw: RidershipExtra['raw'] = { station, passengers: count, change_pct: yoy, rank };
                    const extra: RidershipExtra = {
                        source: 'odakyu',
                        operator: OPERATOR,
                        station,
                        line,
                        fiscal_year: fiscalYear,
                        daily_average: parseCount(count),
                        unit: '人/日',
                        rank: parseCount(rank),
                        yoy_pct: parsePct(yoy),
                        raw,
                    };
                    return ridershipItem(extra, LINK);
                })
                .filter((item): item is ReturnType<typeof ridershipItem> => item !== null);
        });
    return { fiscalYear, items };
};

export const handler = async (): Promise<Data> => {
    const page = (await cache.tryGet(LINK, async () => parsePage(await ofetch(LINK)))) as ReturnType<typeof parsePage>;
    return {
        title: `小田急電鉄 ${page.fiscalYear}年度 1日平均駅別乗降人員`,
        link: LINK,
        language: 'ja',
        item: page.items,
    };
};

export const route: Route = {
    path: '/ridership',
    name: '駅別乗降人員',
    url: 'www.odakyu.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/odakyu/ridership',
    parameters: {},
    description: `Annual 1日平均駅別乗降人員 for every Odakyu station (小田原線 / 江ノ島線 / 多摩線), from [鉄道部門：駅別乗降人員・輸送人員ほか](${LINK}). The operator publishes only the current fiscal year on this page, so there is no year parameter. One item per station; \`_extra\` carries \`operator\`, \`station\`, \`line\`, \`fiscal_year\`, \`daily_average\` (人/日), \`rank\` (順位 across all lines), \`yoy_pct\` (増減率) and the page's cell text in \`raw\`. The operator does not publish a release date, so items have no \`pubDate\`.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.odakyu.jp/company/railroad/users/'],
            target: '/ridership',
        },
    ],
};
