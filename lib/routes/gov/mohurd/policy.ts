import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/policy',
    categories: ['government'],
    example: '/gov/mohurd/policy',
    radar: [
        {
            source: ['www.mohurd.gov.cn/zhengcefabu/index.html'],
        },
    ],
    name: '政策发布',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.mohurd.gov.cn/zhengcefabu/index.html',
};

async function handler() {
    const baseUrl = 'https://www.mohurd.gov.cn';
    const link = `${baseUrl}/zhengcefabu/index.html`;

    const indexPage = await ofetch(link);
    const $index = load(indexPage);
    const script = $index('script[src*="unitbuild.js"]');
    const query = JSON.parse(script.attr('querydata')!.replaceAll("'", '"'));

    const response = await ofetch(new URL(script.attr('url')!, baseUrl).href, { query });
    const $ = load(response.data.html);

    const list = $('li.date')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('.date-info').text()), 8),
            };
        })
        .slice(0, 1);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.editor-content').html();

                return item;
            })
        )
    );

    return {
        title: '中华人民共和国住房和城乡建设部 - 政策发布',
        link,
        item: items,
    };
}
