import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

export const route: Route = {
    path: '/news',
    categories: ['travel'],
    example: '/lvshunmuseum/news',
    name: 'News',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['lvshunmuseum.cn/news/'],
            target: '/news',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://lvshunmuseum.cn';
        const listUrl = `${baseUrl}/news/`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await ofetch(listUrl);
        const $ = load(response);

        const list = $('ul.newslist > li')
            .toArray()
            .map((el): DataItem => {
                const $item = $(el);
                const url = new URL($item.find('a').attr('href')!, baseUrl);

                return {
                    // The title in the list page is truncated, the full title is taken from the detail page
                    title: $item.find('.newstitle > h1').text(),
                    link: url.href,
                    pubDate: timezone(parseDate($item.find('.newstitle > .date').text()), 8),
                };
            });

        const items = await pMap(
            list,
            (item) =>
                cache.tryGet(item.link!, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link!);
                    const $detail = load(detailResponse);

                    const $content = $detail('.newsdetail_content');
                    $content.find('img').each((_, img) => {
                        const $img = $detail(img);
                        $img.attr('src', new URL($img.attr('src')!, baseUrl).href);
                    });

                    return {
                        ...item,
                        title: $detail('.newsdetail_title > h1').text(),
                        description: $content.html() || undefined,
                    };
                }),
            { concurrency: 3 }
        );

        return {
            title: `${museumName} - 最新动态`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
