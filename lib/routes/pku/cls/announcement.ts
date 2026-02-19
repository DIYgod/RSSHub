import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const homeUrl = 'https://bio.pku.edu.cn/homes/Index/news/21/21.html';

const baseUrl = 'https://bio.pku.edu.cn';

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
            source: ['bio.pku.edu.cn/homes/Index/news/21/21.html', 'bio.pku.edu.cn/'],
        },
    ],
    name: '生命科学学院通知公告',
    maintainers: ['william-swl'],
    handler,
    url: 'bio.pku.edu.cn/homes/Index/news/21/21.html',
};

async function handler() {
    const response = await got(homeUrl);

    const $ = load(response.data);

    const list = $('div.normal_list>ul a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: $(item).find('p').text().trim(),
                pubDate: parseDate($(item).find('span.date').text()),
                link: baseUrl + $(item).attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('div.page div.common_width div.col-md-9').first().html();
                return item;
            })
        )
    );

    return {
        title: '北京大学生命科学学院通知公告',
        link: homeUrl,
        item: items,
    };
}
