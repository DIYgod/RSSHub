import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateStrict } from '@/utils/time';

const baseIndexUrl = 'https://www.sice.uestc.edu.cn/index.htm';

export const route: Route = {
    path: '/sice',
    categories: ['university'],
    example: '/uestc/sice',
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
            source: ['sice.uestc.edu.cn/'],
        },
    ],
    name: '信息与通信工程学院',
    maintainers: ['huyyi', 'mobyw'],
    handler,
    url: 'sice.uestc.edu.cn/',
};

async function handler() {
    const content = await ofetch(baseIndexUrl);

    const $ = load(content);

    const out = $('.tzlist li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const yearMonth = $item.find('time em').text();
            const day = $item.find('time span').text();

            return {
                title: $item.find('.txt p').text(),
                link: new URL($item.find('a[href]').attr('href')!, baseIndexUrl).href,
                pubDate: parseDateStrict(`${yearMonth.replace('.', '-')}-${day}`, 'YYYY-MM-DD', 8),
            };
        });

    return {
        title: '信通学院通知',
        link: baseIndexUrl,
        description: '电子科技大学信息与通信工程学院通知公告',
        item: out,
    };
}
