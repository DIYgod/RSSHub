import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const url = 'https://www.njit.edu.cn/index/tzgg.htm';
const host = 'https://www.njit.edu.cn';

export const route: Route = {
    path: '/tzgg',
    categories: ['university'],
    example: '/njit/tzgg',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.njit.edu.cn/'],
        },
    ],
    name: '通知公告',
    maintainers: ['zefengdaguo'],
    handler,
    url: 'www.njit.edu.cn/',
};

async function handler() {
    const response = await got(url);
    const $ = load(response.body);

    const notices = $('ul.date-list li')
        .toArray()
        .flatMap((element) => {
            const $item = $(element);
            const href = $item.find('a').attr('href');
            if (!href) {
                return [];
            }
            const date = `${$item.find('.date span').text()}-${$item.find('.date p').text()}`;
            return {
                title: $item.find('.text .l2').text(),
                link: new URL(href, url).href,
                pubDate: parseDateInTimezone(date, 8),
            };
        });

    const out = await pMap(
        notices,
        (notice) => {
            const itemUrl = notice.link;
            if (itemUrl.includes('content.jsp')) {
                const single = {
                    title: notice.title,
                    link: itemUrl,
                    description: '该通知仅限校内访问，请点击原文链接↑',
                    pubDate: notice.pubDate,
                };
                return single;
            }
            return cache.tryGet(itemUrl, async () => {
                const response = await got(itemUrl);
                const $ = load(response.body);
                const single = {
                    title: notice.title,
                    link: itemUrl,
                    description: $('.v_news_content')
                        .html()!
                        .replaceAll('src="/', () => `src="${new URL('.', host).href}`)
                        .replaceAll('href="/', () => `href="${new URL('.', host).href}`)
                        .trim(),
                    pubDate: notice.pubDate,
                };
                return single;
            });
        },
        { concurrency: 6 }
    );
    return {
        title: '南京工程学院 -- 通知公告',
        link: url,
        item: out,
    };
}
