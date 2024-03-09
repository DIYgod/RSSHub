import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_url = 'https://rustcc.cn';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/rustcc/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['rustcc.cn/'],
    },
    name: '新闻/聚合',
    maintainers: ['zhenlohuang'],
    handler,
    url: 'rustcc.cn/',
};

async function handler() {
    const news_url = 'https://rustcc.cn/section?id=f4703117-7e6b-4caf-aa22-a3ad3db6898f';

    const response = await got({
        url: news_url,
        headers: {
            Referer: base_url,
        },
    });

    const $ = load(response.data);
    const list = $('.article-list li').get();

    return {
        title: 'Rust语言中文社区 | 新闻/聚合',
        link: news_url,
        description: `获取Rust语言中文社区的新闻/聚合`,
        item: await Promise.all(list.map((item) => getFeedItem(item))),
    };
}

function getFeedItem(item) {
    const $ = load(item);
    const title = $('.title');

    return {
        title: title.text(),
        link: `${base_url}${title.attr('href')}`,
        description: $('.info .tags').text(),
        pubDate: timezone(parseDate($('.info .timestamp').text(), 'YYYY-MM-DD hh:mm'), +8),
    };
}
