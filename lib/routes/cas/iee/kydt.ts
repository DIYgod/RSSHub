import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/iee/kydt',
    categories: ['university'],
    example: '/cas/iee/kydt',
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
            source: ['www.iee.cas.cn/xwzx/kydt', 'www.iee.cas.cn/'],
        },
    ],
    name: '电工研究所 科研动态',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.iee.cas.cn/xwzx/kydt',
};

async function handler() {
    const rootUrl = 'http://www.iee.cas.cn/xwzx/kydt/';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);
    const list = $('li.entry .entry-content-title')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('.article-content').html();
                item.pubDate = timezone(parseDate(content('time').text().split('：')[1]), 8);

                return item;
            })
        )
    );

    return {
        title: '科研成果 - 中国科学院电工研究所',
        link: rootUrl,
        item: items,
    };
}
