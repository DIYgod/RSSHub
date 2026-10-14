import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/hqjt',
    categories: ['university'],
    example: '/nju/hqjt',
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
            source: ['hqjt.nju.edu.cn/zbcg/list.htm'],
        },
    ],
    name: '后勤集团',
    maintainers: ['ret-1'],
    handler,
    url: 'hqjt.nju.edu.cn/zbcg/list.htm',
};

const url = 'https://hqjt.nju.edu.cn/zbcg/list.htm';

async function handler() {
    const response = await got(url);
    const $ = load(response.data);
    const items = $('li.news')
        .toArray()
        .flatMap((element) => {
            const $item = $(element);
            const anchor = $item.find('.news_title a');
            const href = anchor.attr('href');
            if (!href) {
                return [];
            }
            return {
                title: anchor.attr('title') || anchor.text(),
                link: new URL(href, url).href,
                pubDate: timezone(parseDate($item.find('.news_meta').text(), 'YYYY-MM-DD'), 8),
                category: '招标采购',
            };
        });

    return {
        title: '后勤集团-招标采购',
        link: url,
        item: items,
    };
}
