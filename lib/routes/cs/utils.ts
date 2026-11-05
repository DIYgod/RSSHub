import type { CheerioAPI } from 'cheerio';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const currentCategoryPaths = {
    xwzx: '/yaowen.html',
    ssgs: '/gongsi.html',
    gppd: '/shichang.html',
    tzjj: '/jijin.html',
    cj2020: '/ssgs/cj2020/list.html',
    zzqh2020: '/zzqh2020/list.html',
    hw2020: '/hw2020/list.html',
    'xwzx/hg': '/xwzx/01/list.html',
    'xwzx/jr': '/xwzx/jr/list.html',
    'xwzx/msxf': '/xwzx/msxf/list.html',
    'ssgs/gsxw': '/ssgs/01/list.html',
    'ssgs/gssd': '/ssgs/gssd/list.html',
    'ssgs/gsxl': '/ssgs/07/list.html',
    'gppd/gsyj': '/gppd/gsyj/list.html',
    'gppd/ggzx': '/gppd/ggzx/list.html',
    'gppd/zqxw': '/gppd/zqxw/list.html',
    'gppd/hwbd': '/hw2020/list.html',
    'gppd/qhbd': '/zzqh2020/list.html',
    'tzjj/jjdt': '/tzjj/01/list.html',
    'tzjj/jjks': '/tzjj/03/list.html',
    'tzjj/jjcs': '/tzjj/jjcs/list.html',
    'tzjj/smjj': '/tzjj/smjj/list.html',
    'tzjj/tjdh': '/tzjj/tjdh/list.html',
    qs: '/quanshang.html',
    yh: '/yh/list.html',
    bx: '/bx/list.html',
    'sylm/jsbd': '/sylm/jsbd/list.html',
    'yc/ipojz': '/IPO.html',
    'yc/gsnjd': '/gsnjd.html',
};

interface ArticleRecord {
    title: string;
    url: string;
    external_link?: string;
    pub_date?: string;
    miAuthor?: string;
    miSummary?: string;
    miCover43?: string;
    subNm?: string;
}

export async function getCurrentItems($: CheerioAPI, currentUrl: string): Promise<Array<DataItem & { link: string }>> {
    const pageScripts = $('script:not([src])')
        .toArray()
        .map((script) => $(script).text())
        .join('\n');
    const guideUrls = $('script[src]')
        .toArray()
        .map((script) => $(script).attr('src')!)
        .filter((src) => /\/js\/\d+\/mi4_page_articles_guide\.js$/.test(src));
    const batches = await Promise.all(
        guideUrls.map(async (src) => {
            const guideUrl = new URL(src, currentUrl).href;
            const channelId = /\/js\/(\d+)\//.exec(src)![1];
            const channelPageSize = new RegExp(`getMi4PageList\\(PAGE_INDEX_MAP${channelId},\\s*['"]${channelId}['"],\\s*0,\\s*(\\d+)`).exec(pageScripts)?.[1];
            const firstPageSize = Number(channelPageSize || /var\s+pageSize\s*=\s*(\d+)/.exec(pageScripts)?.[1]);
            if (!firstPageSize) {
                throw new Error(`The current CS page has no native first-page size for channel ${channelId}: ${currentUrl}.`);
            }
            const guide = await ofetch(guideUrl, { responseType: 'text' });
            const index = JSON.parse(guide.slice(guide.indexOf('{'), guide.lastIndexOf('}') + 1)) as Record<string, string>;
            const files: string[] = [];
            let count = 0;
            for (let position = 1; position <= Number(index.fileCount) && count < firstPageSize; position++) {
                const file = index[position];
                if (!file || !/^mi4_sub_articles_\d{8}\.js$/.test(file)) {
                    throw new Error(`The current CS article index has no valid data file at position ${position}: ${guideUrl}.`);
                }
                files.push(file);
                count += Number(index[`page_${position}_totalCnt`]);
            }
            const records = (
                await Promise.all(
                    files.map(async (file) => {
                        const raw = await ofetch(new URL(file, guideUrl).href, { responseType: 'text' });
                        return JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)) as ArticleRecord[];
                    })
                )
            ).flat();
            return records.slice(0, firstPageSize).map((record): DataItem & { link: string } => ({
                title: record.title,
                link: new URL(record.external_link || record.url, currentUrl).href,
                pubDate: record.pub_date ? timezone(parseDate(record.pub_date), 8) : undefined,
                author: record.miAuthor || undefined,
                summary: record.miSummary || undefined,
                image: record.miCover43 || undefined,
                category: record.subNm ? [record.subNm] : undefined,
            }));
        })
    );
    return new Map(batches.flat().map((item) => [item.link, item])).values().toArray();
}
