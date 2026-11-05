import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const homeUrl = 'https://www.bio.pku.edu.cn/homes/Index/news/21/21.html';

const baseUrl = 'https://www.bio.pku.edu.cn';

export const route: Route = {
    path: '/cls/announcement',
    categories: ['university'],
    example: '/pku/cls/announcement',
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
            source: ['www.bio.pku.edu.cn/homes/Index/news/21/21.html', 'www.bio.pku.edu.cn/'],
        },
    ],
    name: '生命科学学院通知公告',
    maintainers: ['william-swl'],
    handler,
    url: 'www.bio.pku.edu.cn/homes/Index/news/21/21.html',
};

async function handler() {
    const response = await got(homeUrl);

    const $ = load(response.data);

    const list = $('div.normal_list>ul a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $($item).find('p').text(),
                pubDate: $item.find('span.date').text() ? parseDate(`${$item.find('span.date').text().replaceAll('.', '-')}T00:00:00Z`) : undefined,
                link: baseUrl + $($item).attr('href'),
            };
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`pku:cls:announcement:detail:v2:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                return { description: $('div.page div.common_width div.col-md-9').first().html() };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '北京大学生命科学学院通知公告',
        link: homeUrl,
        item: items,
    };
}
