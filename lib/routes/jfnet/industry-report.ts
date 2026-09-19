import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const HOST = 'https://www.jfnet.or.jp';
const INDEX = `${HOST}/industry_report/?c=29&y=0`; // c=29 → 月次レポート only
const MEDIA_API = `${HOST}/wp-json/wp/v2/media?search=getujidata&per_page=100&_fields=date,source_url`;

export interface MarketReportExtra {
    source: 'jfnet';
    survey: '外食産業市場動向調査';
    month: string; // 'YYYY-MM' (survey month, 〜月度)
    pdf: string;
    xls: string | null;
    released_at: string | null; // upload date of the PDF, ISO 8601 (local time as returned by WordPress)
}

/**
 * Index rows (`div.flex.items-center.border-b`): [title, period '2026年7月', PDF link, Excel link].
 * The monthly figures exist only inside the PDF / XLS (no HTML table), so the item carries the files.
 */
const parseIndex = (html: string): Array<Omit<MarketReportExtra, 'released_at'> & { title: string }> => {
    const $ = load(html);
    return $('div.flex.items-center.border-b')
        .toArray()
        .map((row) => {
            const cols = $(row).children('div');
            const title = cols.eq(0).text().trim();
            const period = cols
                .eq(1)
                .text()
                .trim()
                .match(/(\d{4})年(\d{1,2})月/);
            const pdf = $(row).find('a[href$=".pdf"]').attr('href');
            const xls = $(row).find('a[href$=".xls"], a[href$=".xlsx"]').attr('href');
            if (!title || !period || !pdf) {
                return null;
            }
            return {
                title,
                source: 'jfnet' as const,
                survey: '外食産業市場動向調査' as const,
                month: `${period[1]}-${period[2].padStart(2, '0')}`,
                pdf: new URL(pdf, HOST).href,
                xls: xls ? new URL(xls, HOST).href : null,
            };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);
};

export const handler = async (): Promise<Data> => {
    const [entries, media] = await Promise.all([
        cache.tryGet(INDEX, async () => parseIndex(await ofetch(INDEX))) as Promise<ReturnType<typeof parseIndex>>,
        cache.tryGet(MEDIA_API, async () => {
            const list: Array<{ date: string; source_url: string }> = await ofetch(MEDIA_API);
            return Object.fromEntries(list.map((m) => [m.source_url, m.date]));
        }) as Promise<Record<string, string>>,
    ]);

    const items: DataItem[] = entries.map((e) => {
        const releasedAt = media[e.pdf] ?? null;
        const [year, month] = e.month.split('-', 2);
        const label = `${year}年${Number(month)}月度`;
        return {
            title: `${e.survey} ${label}`,
            link: e.pdf,
            guid: e.pdf,
            pubDate: releasedAt === null ? undefined : parseDate(releasedAt),
            description: `${e.survey}（月次レポート） ${label} — <a href="${e.pdf}">PDF</a>${e.xls ? ` / <a href="${e.xls}">Excel</a>` : ''}`,
            _extra: { ...e, title: undefined, released_at: releasedAt } as unknown as MarketReportExtra,
        };
    });

    return {
        title: '日本フードサービス協会 外食産業市場動向調査（月次）',
        link: INDEX,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/industry-report',
    name: '外食産業市場動向調査（月次）',
    url: 'www.jfnet.or.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/jfnet/industry-report',
    parameters: {},
    description: `Monthly releases of the 外食産業市場動向調査 from [業界データ](${HOST}/industry_report/). One item per survey month linking the PDF and Excel files; \`_extra\` carries \`month\` (YYYY-MM), \`pdf\`, \`xls\` and \`released_at\` (the file's upload date from the site's WordPress media API). The segment figures (売上高・客数・客単価 前年同月比) are only published inside the files and are not extracted: the site's 利用規約 reserves reproduction of its 資料 to prior permission.`,
    categories: ['finance'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.jfnet.or.jp/industry_report'],
            target: '/industry-report',
        },
    ],
};
