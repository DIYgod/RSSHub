import type { Route } from '@/types';

import { handler } from './bksy';

export const route: Route = {
    path: '/jwb/:type?',
    categories: ['university'],
    example: '/shu/jwb/notice',
    parameters: { type: '分类，默认为通知公告' },
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
            source: ['jwb.shu.edu.cn/', 'jwb.shu.edu.cn/index/tzgg.htm', 'jwb.shu.edu.cn/index/xw.htm'],
            target: '/jwb',
        },
    ],
    name: '教务部（已更名为本科生院）',
    maintainers: ['tuxinghuan', 'GhhG123'],
    handler,
    url: 'bksy.shu.edu.cn/',
    description: '上海大学教务部已更名为本科生院，本路由与 `/shu/bksy/:type?` 使用同一后端。',
};
