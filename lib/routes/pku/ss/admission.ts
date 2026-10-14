import pMap from 'p-map';

import type { Route } from '@/types';

import { getArticle, getSingleRecord } from './common';

const host = 'https://ss.pku.edu.cn/zsxx/zstz/index.htm';

export const route: Route = {
    path: '/ss/admission',
    categories: ['university'],
    example: '/pku/ss/admission',
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
            source: ['ss.pku.edu.cn/zsxx/zstz/index.htm', 'ss.pku.edu.cn/'],
        },
    ],
    name: '软件与微电子学院 - 招生通知',
    maintainers: ['legr4ndk'],
    handler,
    url: 'ss.pku.edu.cn/zsxx/zstz/index.htm',
};

async function handler() {
    const items = await getSingleRecord(host);
    const out = await pMap(items, getArticle, { concurrency: 3 });

    return {
        title: '北大软微-招生通知',
        description: '北京大学软件与微电子学院 - 招生通知',
        link: host,
        item: out,
    };
}
