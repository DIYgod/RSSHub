import type { Route } from '@/types';

import { getNoticeList } from './utils';

const url = 'https://www.njxzc.edu.cn/89/list.htm';
const host = 'https://www.njxzc.edu.cn';

export const route: Route = {
    path: '/tzgg',
    categories: ['university'],
    example: '/njxzc/tzgg',
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
            source: ['www.njxzc.edu.cn/89/list.htm', 'www.njxzc.edu.cn/'],
        },
    ],
    name: '官网通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'www.njxzc.edu.cn/89/list.htm',
};

async function handler(ctx) {
    const out = await getNoticeList(
        ctx,
        url,
        host,
        'a',
        '.news_meta',
        {
            title: '.arti_title',
            content: '.wp_articlecontent',
            date: '.arti_update',
        },
        '.news_list .news'
    );

    return {
        title: '南京晓庄学院 -- 通知公告',
        link: url,
        item: out,
    };
}
