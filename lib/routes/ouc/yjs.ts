import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/ouc/yjs',
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
            source: ['yz.ouc.edu.cn/5926/list.htm'],
        },
    ],
    name: '研究生院',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yz.ouc.edu.cn/5926/list.htm',
};

async function handler() {
    const link = 'https://yz.ouc.edu.cn/5926/list.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.wp_article_list li');

    return {
        title: '中国海洋大学研究生院',
        link,
        description: '中国海洋大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('.Article_PublishDate').text()),
                };
            }),
    };
}
