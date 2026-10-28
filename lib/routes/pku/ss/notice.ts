import pMap from 'p-map';

import type { Route } from '@/types';

import { getArticle, getSingleRecord } from './common';

const host = 'https://ss.pku.edu.cn/xwzx/tzgg/index.htm';

export const route: Route = {
    path: '/ss/notice',
    categories: ['university'],
    example: '/pku/ss/notice',
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
            source: ['ss.pku.edu.cn/xwzx/tzgg/index.htm', 'ss.pku.edu.cn/'],
        },
    ],
    name: '软件与微电子学院 - 通知公告',
    maintainers: ['legr4ndk'],
    handler,
    url: 'ss.pku.edu.cn/xwzx/tzgg/index.htm',
};

async function handler() {
    const items = await getSingleRecord(host);
    const out = await pMap(items, getArticle, { concurrency: 3 });

    return {
        title: '北大软微-通知公告',
        description: '北京大学软件与微电子学院 - 通知公告',
        link: host,
        item: out,
    };
}
