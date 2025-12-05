import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://yz.chsi.com.cn';

export const route: Route = {
    path: '/kydt',
    categories: ['study'],
    example: '/chsi/kydt',
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
            source: ['yz.chsi.com.cn/kyzx/kydt'],
        },
    ],
    name: '考研动态',
    maintainers: ['SunBK201'],
    handler,
    url: 'yz.chsi.com.cn/kyzx/kydt',
};

async function handler() {
    const response = await got(`${host}/kyzx/kydt`);

    const $ = load(response.data);
    const list = $('ul.news-list').children();

    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const itemTitle = item.find('a').text();
            const itemDate = item.find('.span-time').text();
            const path = item.find('a').attr('href');
            const itemUrl = path.startsWith('http') ? path : host + path;
            return cache.tryGet(itemUrl, async () => {
                let description = '';
                if (!path.startsWith('https://') && !path.startsWith('http://')) {
                    const result = await got(itemUrl);
                    const $ = load(result.data);
                    description = $('#article_dnull').html().trim();
                } else {
                    description = itemTitle;
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
        title: `中国研究生招生信息网 - 考研动态`,
        link: `${host}/kyzx/kydt/`,
        description: '中国研究生招生信息网 - 考研动态',
        item: items,
    };
}
