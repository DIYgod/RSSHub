import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/ouc/jwc',
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
            source: ['jwc.ouc.edu.cn/', 'jwc.ouc.edu.cn/6517/list.htm'],
        },
    ],
    name: '教务处',
    maintainers: ['3401797899'],
    handler,
    url: 'jwc.ouc.edu.cn/',
};

async function handler() {
    const link = 'https://jwc.ouc.edu.cn/6517/list.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.wp_article_list li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.attr('title'),
                link: a.attr('href').startsWith('http') ? a.attr('href') : 'https://jwc.ouc.edu.cn' + a.attr('href'),
                pubDate: parseDate(e.find('span.Article_PublishDate').text(), 'YYYY-MM-DD'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.author = '中国海洋大学教务处';
                item.description = $('.wp_articlecontent').html();
                return item;
            })
        )
    );

    return {
        title: '中国海洋大学教务处',
        link,
        description: '中国海洋大学教务处最新通知',
        item: out,
    };
}
