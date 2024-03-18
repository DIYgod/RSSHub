import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.qlu.edu.cn';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/qlu/notice',
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
            source: ['qlu.edu.cn/tzggsh/list1.htm'],
        },
    ],
    name: '通知公告',
    maintainers: ['SunBK201'],
    handler,
    url: 'qlu.edu.cn/tzggsh/list1.htm',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: `${host}/tzggsh/list1.htm`,
    });

    const $ = load(response.data);
    const list = $('ul.news_list.list2').children();

    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('.news_title').children().text();
            const itemDate = item.find('.news_year').text() + item.find('.news_days').text();
            const path = item.find('.news_title').children().attr('href');
            const itemUrl = path.startsWith('https') ? path : host + path;
            return cache.tryGet(itemUrl, async () => {
                let description = '';
                if (path.startsWith('https')) {
                    description = itemTitle;
                } else {
                    const result = await got(itemUrl);
                    const $ = load(result.data);
                    description = $('.read').html().trim();
                }
                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: timezone(parseDate(itemDate), 8),
                    description,
                };
            });
        })
    );

    return {
        title: `齐鲁工业大学 - 通知公告`,
        link: `${host}/tzggsh/list1.htm`,
        description: '齐鲁工业大学 - 通知公告',
        item: items,
    };
}
