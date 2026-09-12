import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/edu/news',
    categories: ['university'],
    example: '/ynnu/edu/news',
    radar: [
        {
            source: ['jxjy.ynnu.edu.cn/index/:category.htm'],
            target: '/edu/news',
        },
    ],
    name: '继续教育学院 - 新闻',
    maintainers: ['SettingDust'],
    handler,
    url: 'jxjy.ynnu.edu.cn',
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://jxjy.ynnu.edu.cn';

    const lists = await Promise.all(
        ['xwdt', 'tzgg', 'pxdt'].map(async (category) => {
            const link = `${baseUrl}/index/${category}.htm`;
            const response = await ofetch(link);
            const $ = load(response);

            return $('.text-list li a')
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    return {
                        title: $item.find('h3').text(),
                        link: new URL($item.attr('href')!, link).href,
                    };
                });
        })
    );

    const items = await Promise.all(
        lists.flat().map((item) =>
            cache.tryGet(item.link, async (): Promise<DataItem> => {
                const response = await ofetch(item.link);
                const $ = load(response);
                return {
                    ...item,
                    pubDate: timezone(parseDate($('.art-tit p span').text(), '发布日期：YYYY-MM-DD'), 8),
                    description: $('.v_news_content').html(),
                };
            })
        )
    );

    return {
        title: '云南师范大学继续教育学院 #通知',
        link: baseUrl,
        language: 'zh-CN',
        item: items,
    };
}
