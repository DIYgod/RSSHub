import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/library',
    categories: ['university'],
    example: '/scnu/library',
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
            source: ['lib.scnu.edu.cn/news/zuixingonggao', 'lib.scnu.edu.cn/'],
        },
    ],
    name: '图书馆通知',
    maintainers: ['fengkx'],
    handler,
    url: 'lib.scnu.edu.cn/news/zuixingonggao',
};

async function handler() {
    const baseUrl = 'https://lib.scnu.edu.cn';
    const url = `${baseUrl}/news/zuixingonggao/`;
    const res = await got({
        method: 'get',
        url,
    });
    const $ = load(res.data);
    const list = $('.article-list').find('li');

    const items = list.toArray().map((item) => {
        const $item = $(item);
        return {
            title: $item.find('a').text(),
            pubDate: timezone(parseDate($item.find('.clock').text()), 8),
            link: $item.find('a').attr('href'),
        };
    });
    const detailedItems = await pMap(
        items,
        async (item) =>
            item.link
                ? {
                      ...item,
                      description: await cache.tryGet(`scnu:library:v1:${item.link}`, async () => {
                          const loadedSource1 = (await got(item.link!)).data;
                          const article = load(loadedSource1);
                          return article('.article > .content').html() ?? undefined;
                      }),
                  }
                : item,
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: url,
        description: '华南师范大学图书馆 - 通知公告',
        item: detailedItems,
    };
}
