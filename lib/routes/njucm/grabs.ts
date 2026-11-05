import type { Route } from '@/types';

import { getNoticeList } from './utils';

const url = 'https://gra.njucm.edu.cn/2899/list.htm';
const host = 'https://gra.njucm.edu.cn';

export const route: Route = {
    path: '/grabszs',
    categories: ['university'],
    example: '/njucm/grabszs',
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
            source: ['gra.njucm.edu.cn/2899/list.htm', 'gra.njucm.edu.cn/'],
        },
    ],
    name: '研究生院博士招生',
    maintainers: ['real-jiakai'],
    handler,
    url: 'gra.njucm.edu.cn/2899/list.htm',
};

async function handler(ctx) {
    const out = await getNoticeList(ctx, url, host, '.news_list li.news', 'a', {
        title: '.arti_title',
        content: '.wp_articlecontent',
        date: '.arti_update',
    });

    return {
        title: '南京中医药大学 -- 博士招生',
        link: url,
        item: out,
    };
}
