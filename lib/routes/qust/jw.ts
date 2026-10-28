import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const baseUrl = 'https://jw.qust.edu.cn/';

export const route: Route = {
    path: '/jw',
    categories: ['university'],
    example: '/qust/jw',
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
            source: ['jw.qust.edu.cn/tzgg.htm', 'jw.qust.edu.cn/'],
        },
    ],
    name: '教务通知',
    maintainers: ['Silent-wqh'],
    handler,
    url: 'jw.qust.edu.cn/tzgg.htm',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: `${baseUrl}tzgg.htm`,
    });
    const $ = load(response.data);
    const items = $('li[id^="line_u13_"] > a')
        .toArray()
        .map((element) => {
            const linkElement = $(element);
            const itemTitle = linkElement.find('.bt').text();
            const path = linkElement.attr('href');
            const itemUrl = path ? new URL(path, baseUrl).href : undefined;
            return {
                title: itemTitle,
                link: itemUrl,
                pubDate: linkElement.find('.sj .p1').text() ? parseDateInTimezone(linkElement.find('.sj .p1').text(), 8) : undefined,
            };
        });

    const detailedItems = await pMap(
        items,
        async (item) => {
            const link = item.link;
            return {
                ...item,
                description: link
                    ? await cache.tryGet(`qust:notice:v1:${link}`, async () => {
                          const response = await got(link);
                          const detail = load(response.data);
                          return detail('.v_news_content').html() ?? undefined;
                      })
                    : undefined,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '青岛科技大学 - 教务通知',
        link: `${baseUrl}tzgg.htm`,
        item: detailedItems,
    };
}
