import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

import { namespace } from './namespace';

export const route: Route = {
    path: '/yunboxinwen',
    categories: ['travel'],
    example: '/grandcanalmuseum/yunboxinwen',
    radar: [
        {
            source: ['www.grandcanalmuseum.cn/yunboxinwen.html'],
            target: '/yunboxinwen',
        },
    ],
    name: '运博新闻',
    maintainers: ['magazian'],
    handler: async () => {
        const baseUrl = 'https://www.grandcanalmuseum.cn';
        const listUrl = `${baseUrl}/yunboxinwen.html`;
        const response = await ofetch(listUrl);
        const $ = load(response);

        const items = $('.list_news > ul > a')
            .toArray()
            .map((el) => {
                const $a = $(el);
                const $li = $a.find('li');
                const title = $li.find('.title').text();
                const dateText = $li.find('.time').text();
                const pubDate = dateText ? parseDateInTimezone(dateText.replaceAll(/[年月]/g, '-').replace('日', ''), 0) : undefined;
                const href = $a.attr('href')!;
                const link = new URL(href, baseUrl).href;

                return {
                    title,
                    link,
                    pubDate,
                };
            });

        return {
            title: `${namespace.zh?.name || namespace.name} - 运博新闻`,
            link: listUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
