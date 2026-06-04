import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ccs/:type?',
    categories: ['university'],
    example: '/snnu/ccs',
    url: 'ccs.snnu.edu.cn',
    parameters: {
        type: '类型，默认为通知公告 (tzgg)，可选学院动态 (news)、学术活动 (xshd)',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机科学学院',
    maintainers: ['alterkeyy'],
    radar: [
        {
            source: ['ccs.snnu.edu.cn/tzgg/zhgl1.htm'],
            target: '/ccs/tzgg',
        },
        {
            source: ['ccs.snnu.edu.cn/xydt/zhxw1.htm'],
            target: '/ccs/news',
        },
        {
            source: ['ccs.snnu.edu.cn/xssq/xshd.htm'],
            target: '/ccs/xshd',
        },
    ],
    handler: async (ctx) => {
        const { type = 'tzgg' } = ctx.req.param();
        const urlMap = {
            tzgg: {
                url: 'https://ccs.snnu.edu.cn/tzgg/zhgl1.htm',
                name: '通知公告',
            },
            news: {
                url: 'https://ccs.snnu.edu.cn/xydt/zhxw1.htm',
                name: '学院动态',
            },
            xshd: {
                url: 'https://ccs.snnu.edu.cn/xssq/xshd.htm',
                name: '学术活动',
            },
        };

        const configTarget = urlMap[type] || urlMap.tzgg;
        const response = await ofetch(configTarget.url);
        const $ = load(response);
        const list = $('.lunwen dl dd').toArray().slice(0, 10);

        const items = await Promise.all(
            list.map((item) => {
                const $item = $(item);
                const $link = $item.find('a').first();
                const link = new URL($link.attr('href') || '', configTarget.url).href;

                const pubDate = parseDate($item.find('.spani').text());
                const title = $link.text();

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
            title: `陕西师范大学 - 计算机科学学院${configTarget.name}`,
            link: configTarget.url,
            image: 'https://ccs.snnu.edu.cn/images/logo.png',
            item: items,
        };
    },
};
