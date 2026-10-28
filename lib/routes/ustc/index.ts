import { type Cheerio, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const noticeType = {
    jx: { title: '中国科学技术大学 - 教学类通知', url: 'https://ustc.edu.cn/tzgg/jxltz.htm' },
    ky: { title: '中国科学技术大学 - 科研类通知', url: 'https://ustc.edu.cn/tzgg/kyltz.htm' },
    gl: { title: '中国科学技术大学 - 管理类通知', url: 'https://ustc.edu.cn/tzgg/glltz.htm' },
    fw: { title: '中国科学技术大学 - 服务类通知', url: 'https://ustc.edu.cn/tzgg/fwltz.htm' },
};
// function getCookie(ctx) {
//     const cache_key = `ustc-cookie-${new Date().toLocaleDateString()}`;
//     return cache.tryGet(cache_key, async () => {
//         const { headers } = await got('https://ustc.edu.cn/system/resource/code/datainput.jsp', {
//             headers: { 'user-agent': UA },
//         });
//         const cookie = headers['set-cookie']
//             .filter((c) => c.match(/(user_trace_token|X_HTTP_TOKEN)/))
//             .map((c) => c.split(';')[0])
//             .join('; ');
//         return cookie;
//     });
// }
export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/ustc/news/gl',
    parameters: { type: '分类，默认为管理类' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ustc.edu.cn/'],
            target: '/news',
        },
    ],
    name: '官网通知公告',
    maintainers: ['hang333', 'jasongzy'],
    handler,
    url: 'ustc.edu.cn/',
    description: `| 教学类 | 科研类 | 管理类 | 服务类 |
| ------ | ------ | ------ | ------ |
| jx     | ky     | gl     | fw     |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'gl';
    const response = await got({
        method: 'get',
        /* headers: {
            'user-agent': UA,
            cookie: await getCookie(ctx),
        }, */
        url: noticeType[type].url,
    });
    const $ = load(response.data);
    let items = $('table[portletmode=simpleList] > tbody > tr.light')
        .toArray()
        .map((element) => {
            const child = $(element).children();
            const published = $(child[2]).text().trim();
            const info: DataItem = {
                title: $(child[1]).find('a').attr('title')!,
                link: $(child[1]).find('a').attr('href')!.startsWith('../') ? new URL($(child[1]).find('a').attr('href')!, noticeType[type].url).href : $(child[1]).find('a').attr('href'),
                pubDate: published ? timezone(parseDate(published, 'YYYY-MM-DD'), 8) : undefined,
            };
            return info;
        });
    items = await pMap(
        items.filter((item) => item.link),
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author'>>(`ustc:index:detail:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate' | 'author'> = {};
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    const content = $('div.v_news_content');
                    details.description = content.html();
                    if (details.description) {
                        const links = new Set(mapElements(content.find('a[href]'), (_, element) => new URL($(element).attr('href')!, item.link).href));
                        const attachments = $('<ul>');
                        $('ul a[href*="/system/_content/download.jsp"]').each((_, element) => {
                            const href = new URL($(element).attr('href')!, item.link).href;
                            if (links.has(href)) {
                                return;
                            }
                            const attachmentWrapper1 = $('<li>');
                            const attachmentAnchor1 = $('<a>').attr('href', href).text($(element).text());
                            attachmentWrapper1.append(attachmentAnchor1);
                            attachments.append(attachmentWrapper1);
                            links.add(href);
                        });
                        if (attachments.children().length) {
                            details.description += $.html(attachments);
                        }
                    }
                } catch {
                    // Retain the existing optional-detail fallback.
                }
                return details;
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: noticeType[type].title,
        description: noticeType[type].title,
        link: noticeType[type].url,
        item: items,
    };
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
