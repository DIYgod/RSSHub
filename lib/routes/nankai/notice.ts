import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/nankai/notice',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.nankai.edu.cn', 'www.nankai.edu.cn/157/list.htm'],
        },
    ],
    name: '通知公告',
    maintainers: ['vicguo0724'],
    handler: async () => {
        const baseUrl = 'https://www.nankai.edu.cn';
        const listUrl = `${baseUrl}/157/list.htm`;
        const { data: response } = await got(listUrl);
        const $ = load(response);

        const list = $('ul.newslist li')
            .toArray()
            .map((item): DataItem => {
                const $item = $(item);
                const $time = $item.find('.time');
                const day = $time.find('.time-d').text().trim();
                const monthYear = $time.contents().last().text().trim();
                const pubDate = day && monthYear ? timezone(parseDate(`${monthYear}-${day}`, 'YYYY-MM-DD'), 8) : undefined;

                const $link = $item.find('.tit a');
                let href = $link.attr('href') || '';
                href = href.startsWith('http') ? href : new URL(href, baseUrl).href;

                return {
                    title: $link.text(),
                    link: href,
                    pubDate,
                };
            });

        const items = await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`nankai:notice:article:v2:${item.link}`, async () => {
                    // Campus notice links may require access from the university network.
                    if (item.link!.includes('xb.nankai.edu.cn')) {
                        return { description: '该通知可能需要校内访问权限' };
                    }
                    const { data: detailResponse } = await got(item.link);
                    const $detail = load(detailResponse);

                    // Extract the article body.
                    const content = $detail('.wp_articlecontent').html();
                    return { description: content };
                });
                return { ...item, ...detail };
            },
            { concurrency: 3 }
        );

        return {
            title: '南开大学通知公告',
            link: listUrl,
            item: items,
        };
    },
};
