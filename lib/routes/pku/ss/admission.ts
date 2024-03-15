import { Route } from '@/types';
import cache from '@/utils/cache';
import { baseUrl, getSingleRecord, getArticle } from './common';

const host = `${baseUrl}/admission/admnotice/`;

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
            source: ['ss.pku.edu.cn/admission/admnotice', 'ss.pku.edu.cn/'],
        },
    ],
    name: '软件与微电子学院 - 招生通知',
    maintainers: ['legr4ndk'],
    handler,
    url: 'ss.pku.edu.cn/admission/admnotice',
};

async function handler() {
    const items = await getSingleRecord(host);
    const out = await Promise.all(items.map((item) => getArticle(item, cache.tryGet)));

    return {
        title: '北大软微-招生通知',
        description: '北京大学软件与微电子学院 - 招生通知',
        link: host,
        item: out,
    };
}
