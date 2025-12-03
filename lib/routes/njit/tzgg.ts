import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    name: '南京工程学院通知公告',
    maintainers: ['zefengdaguo'],
    handler,
    url: 'www.njit.edu.cn/',
};

async function handler() {
    const response = await got({
        method: 'get',
        url,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response.body);

    const urlList = $('body')
        .find('span.text a')
        .toArray()
        .map((e) => $(e).attr('href'));

    const titleList = $('body')
        .find('span.text a')
        .toArray()
        .map((e) => $(e).attr('title'));

    const dateList = $('body')
        .find('span.date')
        .toArray()
        .map((e) => '20' + $(e).text().slice(1, 9));

    const out = await Promise.all(
        urlList.map((itemUrl, index) => {
            itemUrl = new URL(itemUrl, host).href;
            if (itemUrl.includes('content.jsp')) {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '该通知仅限校内访问，请点击原文链接↑',
                    pubDate: parseDate(dateList[index]),
                };
                return single;
            } else {
                return cache.tryGet(itemUrl, async () => {
                    const response = await got({
                        method: 'get',
                        url: itemUrl,
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
                    const $ = load(response.body);
                    const single = {
                        title: $('title').text(),
                        link: itemUrl,
                        description: $('.v_news_content')
                            .html()
                            .replaceAll('src="/', `src="${new URL('.', host).href}`)
                            .replaceAll('href="/', `href="${new URL('.', host).href}`)
                            .trim(),
                        pubDate: parseDate($('.link_1').text().slice(6, 16)),
                    };
                    return single;
                });
            }
        })
    );
    return {
        title: '南京工程学院 -- 通知公告',
        url,
        item: out,
    };
}
