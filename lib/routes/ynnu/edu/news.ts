import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateStrict } from '@/utils/time';

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

function parsePublishedDate(value: string) {
    return parseDateStrict(value.trim(), '发布日期：YYYY-MM-DD', 8);
}

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

    const items = await pMap(
        lists.flat(),
        async (item: DataItem & { link: string }) => {
            const article = await cache.tryGet(`ynnu:article:v4:${item.link}`, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const title = $('.art-tit h3').text();
                return {
                    title: title.trim() ? title : undefined,
                    pubDate: parsePublishedDate($('.art-tit p span').text()),
                    description: $('.v_news_content').html(),
                    category: [$('.channl-menu h2').text().trim()].filter(Boolean),
                };
            });
            return { ...item, ...article, title: article.title ?? item.title };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: '云南师范大学继续教育学院 #通知',
        link: baseUrl,
        language: 'zh-CN',
        item: items,
    };
}
