import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cs/match',
    categories: ['university'],
    example: '/scnu/cs/match',
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
            source: ['cs.scnu.edu.cn/xueshenggongzuo/chengchangfazhan/kejichuangxin/', 'cs.scnu.edu.cn/'],
        },
    ],
    name: '计算机学院竞赛通知',
    maintainers: ['fengkx'],
    handler,
    url: 'cs.scnu.edu.cn/xueshenggongzuo/chengchangfazhan/kejichuangxin/',
};

async function handler() {
    const baseUrl = 'http://cs.scnu.edu.cn';
    const url = `${baseUrl}/xueshenggongzuo/chengchangfazhan/kejichuangxin/`;
    const res = await got({
        method: 'get',
        url,
    });
    const $ = load(res.data);
    const list = $('.listshow li a');

    const items = list.toArray().map((item) => {
        const $item = $(item);
        return {
            title: $item
                .contents()
                .filter((_, node) => node.type === 'text')
                .text(),
            pubDate: timezone(parseDate($item.find('.r').text()), 8),
            link: $item.attr('href'),
        };
    });
    const detailedItems = await pMap(
        items,
        async (item) =>
            item.link
                ? {
                      ...item,
                      description: await cache.tryGet(`scnu:cs:v1:${item.link}`, async () => {
                          const loadedSource1 = (await got(item.link!, { allowH2: false })).data;
                          const article = load(loadedSource1);
                          return article('.article-content').html() ?? undefined;
                      }),
                  }
                : item,
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: url,
        description: '华南师范大学计算机学院 学科竞赛',
        item: detailedItems,
    };
}
