import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/snnu/yjs',
    url: 'newyjs.snnu.edu.cn',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院通知公告',
    maintainers: ['alterkeyy'],
    radar: [
        {
            source: ['newyjs.snnu.edu.cn/tzgg1.htm'],
            target: '/yjs',
        },
    ],
    handler: async () => {
        const url = 'https://newyjs.snnu.edu.cn/tzgg1.htm';
        const response = await ofetch(url);
        const $ = load(response);
        const list = $('.n_bt li').toArray().slice(0, 10);

        const items = await Promise.all(
            list.map((item) => {
                const $item = $(item);
                const $link = $item.find('a').first();
                const link = new URL($link.attr('href') || '', url).href;

                const pubDate = parseDate($link.find('em').text());
                const title = $link.attr('title') || $link.find('p').text() || $link.text();

                return cache.tryGet(link, async () => {
                    try {
                        const detailResponse = await ofetch(link);
                        const $$ = load(detailResponse);
                        const description = $$('.v_news_content').html() || $$('#vsb_content').html() || '';

                        return {
                            title,
                            link,
                            description,
                            pubDate,
                        };
                    } catch {
                        return {
                            title,
                            link,
                            pubDate,
                        };
                    }
                });
            })
        );

        return {
            title: '陕西师范大学 - 研究生院通知公告',
            link: url,
            image: 'https://newyjs.snnu.edu.cn/2024html/images24/logo01.png',
            item: items,
        };
    },
};
