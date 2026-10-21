import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

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
        const list = $('.n_bt li').slice(0, 10).toArray();

        const items = await pMap(
            list,
            async (item) => {
                const $item = $(item);
                const $link = $item.find('a');
                const link = new URL($link.attr('href') || '', url).href;

                const date = $link.find('em').text();
                const pubDate = date ? parseDateInTimezone(date, 8) : undefined;
                const title = $link.attr('title') || $link.find('p').text() || $link.text();

                const metadata = { title, link, pubDate };
                try {
                    const detail = await cache.tryGet(link, async () => {
                        const detailResponse = await ofetch(link);
                        const $$ = load(detailResponse);
                        return { description: $$('.v_news_content').html() || $$('#vsb_content').html() };
                    });
                    return { ...metadata, ...detail };
                } catch (error) {
                    if (error instanceof FetchError) {
                        return metadata;
                    }
                    throw error;
                }
            },
            { concurrency: 3 }
        );

        return {
            title: '陕西师范大学 - 研究生院通知公告',
            link: url,
            image: 'https://newyjs.snnu.edu.cn/2024html/images24/logo01.png',
            item: items,
        };
    },
};
