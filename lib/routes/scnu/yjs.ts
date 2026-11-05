import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/scnu/yjs',
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
            source: ['yz.scnu.edu.cn/tongzhigonggao/ssgg', 'yz.scnu.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yz.scnu.edu.cn/tongzhigonggao/ssgg',
};

async function handler() {
    const link = 'https://yz.scnu.edu.cn/tongzhigonggao/ssgg/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.listmod div a');

    const items = list.toArray().map((item) => {
        const $item = $(item);
        return {
            title: $item.text(),
            link: $item.attr('href'),
        };
    });
    const detailedItems = await pMap(
        items,
        async (item) =>
            item.link
                ? {
                      ...item,
                      ...(await cache.tryGet(`scnu:yjs:v3:${item.link}`, async () => {
                          const loadedSource1 = (await got(item.link!)).data;
                          const article = load(loadedSource1);
                          const date = article('h1').next('p').find('span').first().text();
                          const category = article('.tag a')
                              .toArray()
                              .map((element) => article(element).text().trim())
                              .filter(Boolean);
                          return { description: article('.article').html() ?? undefined, ...(category.length && { category }), pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined };
                      })),
                  }
                : item,
        { concurrency: 3 }
    );

    return {
        title: '华南师范大学研究生院',
        link,
        description: '华南师范大学研究生院通知公告',
        item: detailedItems,
    };
}
