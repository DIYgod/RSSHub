import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/gamegene/news',
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
            source: ['news.gamegene.cn/news'],
        },
    ],
    name: '资讯',
    maintainers: ['lone1y-51'],
    handler,
    url: 'news.gamegene.cn/news',
};

async function handler() {
    const url = 'https://gamegene.cn/news';
    const { data: response } = await got({
        method: 'get',
        url,
    });
    const $ = load(response);
    const list = $('div.mr245')
        .toArray()
        .map((item) => {
            item = $(item);
            const aEle = item.find('a').first();
            const href = aEle.attr('href');
            const title = aEle.find('h3').first().text();
            const author = item.find('a.namenode').text();
            const category = item.find('span.r').text();
            return {
                title,
                link: href,
                author,
                category,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = load(response);
                const dateTime = $('div.meta').find('time').first().text();
                item.pubDate = parseDate(dateTime);
                item.description = $('div.content').first().html();
                return item;
            })
        )
    );

    return {
        // 在此处输出您的 RSS
        item: items,
        link: url,
        title: '游戏基因 GameGene',
    };
}
