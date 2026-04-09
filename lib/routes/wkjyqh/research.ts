import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/research',
    categories: ['finance'],
    example: '/wkjyqh/research',
    radar: [
        {
            source: ['www.wkjyqh.com/main/research_center/yjbg/index.shtml', 'www.wkjyqh.com/main/research_center/'],
        },
    ],
    name: '研究报告',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.wkjyqh.com/main/research_center/yjbg/index.shtml',
};

async function handler() {
    const baseUrl = 'https://www.wkjyqh.com';
    const link = `${baseUrl}/main/research_center/yjbg/index.shtml`;

    const apiResponse = await ofetch(`${baseUrl}/servlet/json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            funcNo: '2000153',
            catalogId: '232',
            pageNow: '1',
            pageSize: '15',
            isFilter: '1',
            titleLength: '35',
            briefLength: '70',
            _catalogId: '',
            rightId: '',
        }),
        responseType: 'json',
    });

    const list: DataItem[] = apiResponse.results[0].data.map((item) => ({
        title: item.title,
        link: new URL(item.url, baseUrl).href,
        pubDate: timezone(parseDate(item.publish_date), +8),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('.article_detail');
                content.find('h2, .tips').remove();

                item.description = content.html()?.trim();

                return item;
            })
        )
    );

    return {
        title: '五矿期货 - 研究报告',
        link,
        language: 'zh-CN' as const,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
