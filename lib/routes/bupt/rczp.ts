import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/rczp',
    categories: ['university'],
    example: '/bupt/rczp',
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
            source: ['bupt.edu.cn/'],
        },
    ],
    name: '人才招聘',
    maintainers: ['nczitzk'],
    handler,
    url: 'bupt.edu.cn/',
};

async function handler() {
    const rootUrl = 'https://www.bupt.edu.cn';
    const currentUrl = `${rootUrl}/rczp.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.date-block')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.next().text(),
                link: `${rootUrl}/${item.next().attr('href')}`,
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

                item.description = content('.v_news_content').html();
                item.pubDate = timezone(parseDate(content('.info span').first().text().replace('发布时间 : ', '')), +8);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
