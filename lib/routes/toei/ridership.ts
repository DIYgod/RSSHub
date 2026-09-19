import type { RidershipExtra } from '@/routes/tokyometro/utils';
import { ridershipItem } from '@/routes/tokyometro/utils';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const OPERATOR = '東京都交通局';
const DATASET = 't000018d0000000030'; // 地下鉄関連情報 各駅乗降人員一覧
const PACKAGE_API = `https://catalog.data.metro.tokyo.lg.jp/api/3/action/package_show?id=${DATASET}`;
const CATALOG_PAGE = `https://catalog.data.metro.tokyo.lg.jp/dataset/${DATASET}`;

interface Resource {
    url: string;
    description: string;
    last_modified: string | null;
}

/** '《都営地下鉄》 - [地下鉄関連情報 各駅乗降人員一覧] 浅草線\n\n2024年4月～2025年3月' → line + fiscal year. */
const parseResource = (r: Resource): { line: string; fiscalYear: number } | null => {
    const line = r.description.match(/\]\s*(\S+線)/)?.[1];
    const year = r.description.match(/(\d{4})年4月/)?.[1];
    return line && year ? { line, fiscalYear: Number(year) } : null;
};

/**
 * One Shift_JIS CSV per line: `駅名,一日平均乗車人員,一日平均降車人員`, plain digits, a final `計NN駅` row.
 * The publisher's 浅草線 file labels its first row (西馬込) as 馬込; the operator's own table shows 西馬込, so that row is relabelled.
 */
const parseCsv = (buf: ArrayBuffer, line: string, fiscalYear: number, link: string) => {
    const text = new TextDecoder('shift_jis').decode(buf);
    const rows = text
        .split(/\r?\n/)
        .slice(1)
        .map((l) => l.split(',').map((c) => c.trim()))
        .filter((cells) => cells.length >= 3 && cells[0] !== '' && !cells[0].startsWith('計'));
    return rows.map((cells, index) => {
        const [label, boarding, alighting] = cells;
        const station = line === '浅草線' && index === 0 && label === '馬込' && rows[1]?.[0] === '馬込' ? '西馬込' : label;
        const on = /^\d+$/.test(boarding) ? Number(boarding) : null;
        const off = /^\d+$/.test(alighting) ? Number(alighting) : null;
        const extra: RidershipExtra = {
            source: 'toei',
            operator: OPERATOR,
            station,
            line,
            fiscal_year: fiscalYear,
            daily_average: on === null || off === null ? null : on + off,
            unit: '人/日',
            measure: 'boarding_alighting',
            rank: null,
            yoy_pct: null,
            raw: { station: label, boarding, alighting },
        };
        return ridershipItem(extra, link);
    });
};

export const handler = async (): Promise<Data> => {
    const pkg = (await cache.tryGet(PACKAGE_API, async () => {
        const body = await ofetch(PACKAGE_API);
        const resources: Resource[] = body?.result?.resources ?? [];
        return resources.map((r) => ({ ...r, meta: parseResource(r) })).filter((r) => r.meta !== null);
    })) as Array<Resource & { meta: { line: string; fiscalYear: number } }>;

    const items = (
        await Promise.all(
            pkg.map(
                (r) =>
                    cache.tryGet(`${r.url}#${r.last_modified ?? ''}`, async () => {
                        const buf: ArrayBuffer = await ofetch(r.url, { responseType: 'arrayBuffer' });
                        return parseCsv(buf, r.meta.line, r.meta.fiscalYear, CATALOG_PAGE).map((item) => ({
                            ...item,
                            pubDate: r.last_modified === null ? undefined : parseDate(r.last_modified),
                        }));
                    }) as Promise<Array<ReturnType<typeof ridershipItem>>>
            )
        )
    ).flat();
    const fiscalYear = pkg[0]?.meta.fiscalYear;

    return {
        title: `都営地下鉄 各駅乗降人員${fiscalYear === undefined ? '' : `（${fiscalYear}年度一日平均）`}`,
        link: CATALOG_PAGE,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/ridership',
    name: '都営地下鉄 各駅乗降人員',
    url: 'www.kotsu.metro.tokyo.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/toei/ridership',
    parameters: {},
    description: `Annual 各駅乗降人員 (one-day average of boarding + alighting passengers) for every 都営地下鉄 station, read from the Tokyo open-data catalog dataset [地下鉄関連情報 各駅乗降人員一覧](${CATALOG_PAGE}) (CC BY 4.0, one Shift_JIS CSV per line) — the operator's own [各駅乗降人員一覧](https://www.kotsu.metro.tokyo.jp/subway/kanren/passengers.html) page carries the same figures behind a browser challenge. One item per station and line (stations shared by two lines appear once per line with that line's figures); \`_extra\` follows the shared ridership shape with \`daily_average\` = 乗車 + 降車 and \`measure: 'boarding_alighting'\`. Only the current fiscal year is published and the files are overwritten in place; \`pubDate\` is the resource's last-modified date. Credit: 地下鉄関連情報 各駅乗降人員一覧、東京都・東京都交通局、CC BY 4.0.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.kotsu.metro.tokyo.jp/subway/kanren/passengers.html', `catalog.data.metro.tokyo.lg.jp/dataset/${DATASET}`],
            target: '/ridership',
        },
    ],
};
