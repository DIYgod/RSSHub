import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
        const list = $('.ul-txtq3 li').toArray().slice(0, 10);

        const items = await Promise.all(
            list.map((item) => {
                const $item = $(item);
                const $link = $item.find('a').first();
                const link = new URL($link.attr('href') || '', url).href;

                const pubDate = parseDate($item.find('.date.date2').first().text());

                let title = $item.find('a .txt h3').first().text();
                if (!title) {
                    title = $link.text();
                }

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
                        // Fallback to title and link if detail fetch fails
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
            title: '陕西师范大学 - 通知公告',
            link: url,
            image: 'https://www.snnu.edu.cn/images/logo.png',
            item: items,
        };
    },
};
