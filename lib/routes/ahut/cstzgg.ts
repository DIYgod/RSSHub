import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cstzgg',
    categories: ['university'],
    example: '/ahut/cstzgg',
    name: '计算机学院公告',
    maintainers: ['Diffumist'],
    handler,
};

async function handler() {
    const baseUrl = 'https://cs.ahut.edu.cn';
    const [listResponse, indexResponse] = await Promise.all([ofetch(`${baseUrl}/index/tzgg.htm`), ofetch(`${baseUrl}/index.htm`)]);

    const $list = load(listResponse);
    const list = $list('li[id^="line_u"]')
        .toArray()
        .map((item) => {
            const $item = $list(item);
            return {
                title: $item.find('a').text().trim(),
                link: new URL($item.find('a').attr('href')!, `${baseUrl}/index/tzgg.htm`).href,
                pubDate: timezone(parseDate($item.find('span').text(), 'YYYY/MM/DD'), 8),
            };
        });

    const $index = load(indexResponse);
    const currentYear = new Date().getFullYear();
    const indexList = $index('div[frag="窗口21"] .i-list li')
        .toArray()
        .map((item) => {
            const $item = $index(item);
            return {
                title: $item.find('a').text(),
                link: new URL($item.find('a').attr('href')!, `${baseUrl}/index.htm`).href,
                pubDate: timezone(parseDate(`${currentYear}/${$item.find('span').text()}`, 'YYYY/MM/DD'), 8),
            };
        });

    const seen = new Set(list.map((item) => item.link));
    const merged = [...list, ...indexList.filter((item) => !seen.has(item.link))];

    const out = await Promise.all(
        merged.map((item) => {
            if (item.link.includes('content.jsp')) {
                return item;
            }
            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);

                return {
                    ...item,
                    description: $('.v_news_content').html(),
                };
            });
        })
    );

    return {
        title: '安徽工业大学 - 计算机学院公告',
        link: `${baseUrl}/index/tzgg.htm`,
        description: '安徽工业大学 - 计算机学院公告',
        item: out,
    };
}
