import { load } from 'cheerio';
import pMap from 'p-map';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export async function fetchMain(url: string, dataElement: string) {
    const response = await ofetch(url);
    const $ = load(response);
    return {
        list: $(dataElement)
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    href: $item.children('a').attr('href'),
                    publishDate: $item.children('span').text(),
                };
            }),
        title: $('title').text(),
    };
}

export function fetchDetail(list: Array<{ href?: string; publishDate: string }>, baseUrl: string, contentElement: string) {
    return pMap(
        list,
        async (item) => {
            const href = item.href!.startsWith('http') ? item.href! : baseUrl + item.href;
            const article = await cache.tryGet(href, async () => {
                const response = await ofetch(href);
                const $ = load(response);
                let description = $(contentElement).html();
                if (!description) {
                    description = `无法解析公告, 这可能是因为这是一个外部链接或者文件. 请<a href="${href}">点击查看</a>`;
                }
                return {
                    title: $('title').text(),
                    link: href,
                    description,
                };
            });
            return {
                ...article,
                pubDate: item.publishDate ? timezone(parseDate(item.publishDate, 'YYYY-MM-DD'), 8) : undefined,
            };
        },
        { concurrency: 3 }
    );
}
