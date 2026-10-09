import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/wxchart/:type?',
    categories: ['forecast'],
    view: ViewType.Pictures,
    example: '/jma/wxchart/daily',
    parameters: {
        type: {
            description: 'Chart type',
            options: [
                { value: 'daily', label: '天気図（最新）' },
                { value: 'monthly', label: '過去の実況天気図（今月）' },
            ],
            default: 'daily',
        },
    },
    radar: [
        {
            source: ['www.jma.go.jp/bosai/weather_map/'],
            target: '/wxchart/daily',
        },
        {
            source: ['www.data.jma.go.jp/yoho/wxchart/quickmonthly.html'],
            target: '/wxchart/monthly',
        },
    ],
    name: '天気図',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.jma.go.jp/bosai/weather_map/',
};

const yohoUrl = 'https://www.data.jma.go.jp/yoho';
const archiveUrl = `${yohoUrl}/data/wxchart/quick`;

const areas = {
    near: { region: '日本周辺域', prefix: 'SPAS', mono: false },
    near_monochrome: { region: '日本周辺域', prefix: 'SPAS', mono: true },
    asia: { region: 'アジア太平洋域', prefix: 'ASAS', mono: false },
    asia_monochrome: { region: 'アジア太平洋域', prefix: 'ASAS', mono: true },
};

const charts = {
    spas: '実況天気図',
    asas: '実況天気図',
    fsas24: '24時間予想天気図',
    fsas48: '48時間予想天気図',
};

const toJst = (marker: string) => timezone(parseDate(marker.slice(0, 12), 'YYYYMMDDHHmm'), -9);
const toYmd = (date: Date) => date.toISOString().slice(0, 10).replaceAll('-', '');

async function handler(ctx: Context) {
    const { type = 'daily' } = ctx.req.param();
    return type === 'monthly' ? await monthly() : await daily();
}

async function daily() {
    const bosaiUrl = 'https://www.jma.go.jp/bosai/weather_map';
    const list = await ofetch<Record<keyof typeof areas, Record<string, string[]>>>(`${bosaiUrl}/data/list.json`);

    const files = Object.entries(list).flatMap(([area, chartGroups]) =>
        Object.values(chartGroups)
            .flat()
            .map((file) => {
                // 20260915141230_0_Z__C_010000_20260915120000_MET_CHT_JCIspas_JCP600x581_JRcolor_Tjmahp_image.png
                const [, issued, valid, chart] = file.match(/^(\d{14})_.+?_(\d{14})_MET_CHT_JCI(\w+?)_/)!;
                return { ...areas[area], file, issued, valid, chart };
            })
    );

    const items = Map.groupBy(files, ({ region, chart, valid }) => `${region}_${chart}_${valid}`)
        .values()
        .toArray()
        .map((group): DataItem => {
            const { region, prefix, chart, valid, issued } = group[0];
            const lead = { fsas24: 24, fsas48: 48 }[chart] ?? 0;
            const jst = timezone(parseDate(valid, 'YYYYMMDDHHmmss'), -(9 + lead));
            const description = group
                .map(({ file, prefix, mono }) => {
                    let html = `<img src="${bosaiUrl}/data/png/${file}">`;
                    if (chart === 'spas' || chart === 'asas') {
                        const archiveFile = `${archiveUrl}/${valid.slice(0, 6)}/${prefix}_${mono ? 'MONO' : 'COLOR'}_${valid.slice(0, 12)}`;
                        html += `<br><a href="${archiveFile}.png">[PNG]</a> <a href="${archiveFile}.svgz">[SVG]</a> <a href="${archiveFile}.pdf">[PDF]</a>`;
                    }
                    return html;
                })
                .join('');

            return {
                title: `${charts[chart]} ${region} ${jst.getUTCMonth() + 1}月${jst.getUTCDate()}日${jst.getUTCHours()}時`,
                link: `${yohoUrl}/wxchart/quickdaily.html?show=${toYmd(jst)}#${prefix.toLowerCase()}`,
                guid: `${bosaiUrl}/data/png/${group[0].file}`,
                description,
                pubDate: timezone(parseDate(issued, 'YYYYMMDDHHmmss'), 0),
            };
        });

    return {
        title: '気象庁 天気図',
        link: `${bosaiUrl}/`,
        image: 'https://www.jma.go.jp/bosai/favicon.ico',
        item: items,
    };
}

async function monthly() {
    const [first, latest] = await Promise.all([ofetch<string>(`${archiveUrl}/first.txt`), ofetch<string>(`${archiveUrl}/spas_latest.txt`)]);
    const firstDay = toYmd(toJst(first));
    const latestJst = toJst(latest);
    const latestDay = toYmd(latestJst);
    const ym = latestDay.slice(0, 6);
    const year = Number(ym.slice(0, 4));
    const monthIndex = Number(ym.slice(4, 6)) - 1;

    const items: DataItem[] = Array.from({ length: 31 }, (_, i) => new Date(Date.UTC(year, monthIndex, i + 1)))
        .filter((date) => {
            const ymd = toYmd(date);
            return ymd.slice(0, 6) === ym && ymd >= firstDay && ymd <= latestDay;
        })
        .map((date) => {
            const ymd = toYmd(date);
            const image = ymd === latestDay && latestJst.getUTCHours() < 9 ? `${archiveUrl}/${latest.slice(0, 6)}/SPAS_COLOR_${latest.slice(0, 10)}00.png` : `${archiveUrl}/${ym}/SPAS_COLOR_${ymd}0000.png`;
            return {
                title: `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`,
                link: `${yohoUrl}/wxchart/quickdaily.html?show=${ymd}`,
                description: `<img src="${image}">`,
                pubDate: date,
            };
        });

    return {
        title: `気象庁 ${year}年${monthIndex + 1}月の天気図一覧`,
        link: `${yohoUrl}/wxchart/quickmonthly.html?show=${ym}`,
        image: 'https://www.jma.go.jp/bosai/favicon.ico',
        item: items,
    };
}
