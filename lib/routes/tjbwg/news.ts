import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

const getArticle = async (link: string) => {
    const response = await ofetch(link);
    const $ = load(response);
    return { description: $('.newsD_con').first().html() ?? undefined };
};

export const route: Route = {
    path: '/news',
    categories: ['travel'],
    example: '/tjbwg/news',
    name: 'News',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.tjbwg.cn/cn/NewsList.aspx'],
            target: '/news',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://www.tjbwg.cn';
        const listUrl = `${baseUrl}/cn/NewsList.aspx?TypeId=10926`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await ofetch(listUrl);
        const $ = load(response);

        const list = $('.newsList1 ul li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a');
                const href = a.attr('href') || '';
                const link = new URL(href, `${baseUrl}/cn/`).href;
                const title = a.find('h3').text();
                const dateText = a.find('.time').text().trim();

                return {
                    title,
                    link,
                    pubDate: timezone(parseDate(dateText), 8),
                };
            });

        return {
            title: `${museumName} - 最新公告`,
            link: listUrl,
            language: 'zh-CN',
            item: await pMap(list, async (item) => ({ ...item, ...(await cache.tryGet(item.link, () => getArticle(item.link))) }), { concurrency: 3 }),
        };
    },
};
