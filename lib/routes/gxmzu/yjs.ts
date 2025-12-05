import type { Route } from '@/types';

import { getNoticeList } from './utils';

const url = 'https://yjs.gxmzu.edu.cn/tzgg/zsgg.htm';
const host = 'https://yjs.gxmzu.edu.cn';

export const route: Route = {
    path: '/yjszsgg',
    categories: ['university'],
    example: '/gxmzu/yjszsgg',
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
            source: ['yjs.gxmzu.edu.cn/tzgg/zsgg.htm', 'yjs.gxmzu.edu.cn/'],
        },
    ],
    name: '研究生院招生公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'yjs.gxmzu.edu.cn/tzgg/zsgg.htm',
};

async function handler(ctx) {
    const out = await getNoticeList(ctx, url, host, 'a', '.timestyle55267', {
        title: '.titlestyle55269',
        content: '#vsb_newscontent',
        date: '.timestyle55269',
    });

    return {
        title: '广西民族大学研究生院 -- 招生公告',
        link: url,
        item: out,
    };
}
