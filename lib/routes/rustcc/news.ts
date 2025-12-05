import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://rustcc.cn';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/rustcc/news',
    radar: [
        {
            source: ['rustcc.cn/'],
        },
    ],
    name: '新闻/聚合',
    maintainers: ['zhenlohuang'],
    handler,
    url: 'rustcc.cn/',
};

async function handler() {
    const newsUrl = 'https://rustcc.cn/section?id=f4703117-7e6b-4caf-aa22-a3ad3db6898f';

    const response = await got({
        url: newsUrl,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = load(response.data);
    const list = $('.article-list li').toArray();

    return {
        title: 'Rust语言中文社区 | 新闻/聚合',
        link: newsUrl,
        description: `获取Rust语言中文社区的新闻/聚合`,
        item: list.map((item) => getFeedItem(item)),
    };
}

function getFeedItem(item) {
    const $ = load(item);
    const title = $('.title');

    return {
        title: title.text(),
        link: `${baseUrl}${title.attr('href')}`,
        description: $('.info .tags').text(),
        pubDate: timezone(parseDate($('.info .timestamp').text(), 'YYYY-MM-DD hh:mm'), +8),
    };
}
