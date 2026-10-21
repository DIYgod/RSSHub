import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/',
    categories: ['university'],
    example: '/snnu',
    url: 'www.snnu.edu.cn',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '学校官网 - 通知公告',
    maintainers: ['alterkeyy'],
    radar: [
        {
            source: ['www.snnu.edu.cn/tzgg.htm'],
            target: '/',
        },
    ],
    handler: async () => {
        const url = 'https://www.snnu.edu.cn/tzgg.htm';
        const response = await ofetch(url);
        const $ = load(response);
        const list = $('.ul-txtq3 li').slice(0, 10).toArray();

        const items = await pMap(
            list,
            async (item) => {
                const $item = $(item);
                const $link = $item.find('a');
                const link = new URL($link.attr('href') || '', url).href;

                const date = $item.find('.date.date2').text();
                const pubDate = date ? parseDateInTimezone(date, 8) : undefined;

                let title = $item.find('a .txt h3').text();
                if (!title) {
                    title = $link.text();
                }

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
            title: '陕西师范大学 - 通知公告',
            link: url,
            image: 'https://www.snnu.edu.cn/images/logo.png',
            item: items,
        };
    },
};
