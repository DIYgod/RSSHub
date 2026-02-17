import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://yz.chsi.com.cn';

export const route: Route = {
    path: '/hotnews',
    categories: ['study'],
    example: '/chsi/hotnews',
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
            source: ['yz.chsi.com.cn/'],
        },
    ],
    name: '考研热点新闻',
    maintainers: ['yanbot-team'],
    handler,
    url: 'yz.chsi.com.cn/',
};

async function handler() {
    const response = await got(host);
    const $ = load(response.data);
    const list = $('.focus-part .index-hot a');
    const items = await Promise.all(
        list.map((i, item) => {
            const { href: path, title: itemTitle } = item.attribs;
            let itemUrl = '';
            itemUrl = path.startsWith('http') ? path : host + path;
            return cache.tryGet(itemUrl, async () => {
                let description = '';
                let itemDate;
                if (path) {
                    const result = await got(itemUrl);
                    const $ = load(result.data);
                    description = $('#article_dnull').html() ? $('#article_dnull').html().trim() : itemTitle;
                    if ($('.news-time').text()) {
                        itemDate = $('.news-time').text();
                    }
                } else {
                    description = itemTitle;
                }
                const result = {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                };
                if (itemDate) {
                    result.pubDate = parseDate(itemDate, 'YYYY年MM月DD日');
                }
                return result;
            });
        })
    );

    return {
        title: `中国研究生招生信息网 - 热点`,
        link: host,
        description: '中国研究生招生信息网 - 热点',
        item: items,
    };
}
