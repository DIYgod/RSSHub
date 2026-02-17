import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.ccreports.com.cn';

export const route: Route = {
    path: '/article',
    categories: ['shopping'],
    example: '/ccreports/article',
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
            source: ['www.ccreports.com.cn/'],
        },
    ],
    name: '要闻',
    maintainers: ['EsuRt', 'Fatpandac'],
    handler,
    url: 'www.ccreports.com.cn/',
};

async function handler() {
    const listData = await got.get(rootUrl);
    const $ = load(listData.data);
    const list = $('div.index-four-content > div.article-box')
        .find('div.new-child')
        .toArray()
        .map((item) => ({
            title: $(item).find('p.new-title').text(),
            link: new URL($(item).find('a').attr('href'), rootUrl).href,
            author: $(item)
                .find('p.new-desc')
                .text()
                .match(/作者：(.*?)\s/)[1],
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailData = await got.get(item.link);
                const $ = load(detailData.data);
                item.description = $('div.pdbox').html();
                item.pubDate = timezone(parseDate($('div.newbox > div.newtit > p').text(), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    return {
        title: '消费者报道',
        link: rootUrl,
        item: items,
    };
}
