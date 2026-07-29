import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/work/categorys/:category',
    categories: ['design'],
    example: '/logonews/work/categorys/hotel-catering',
    parameters: { category: '分类，可在对应分类页 URL 中找到' },
    radar: [
        {
            source: ['logonews.cn/work/categorys/:category'],
            target: '/work/categorys/:category',
        },
    ],
    name: '作品分类',
    maintainers: ['nczitzk'],
    handler,
    url: 'logonews.cn/',
    description:
        '如 [LOGO 作品分类：酒店餐饮 - 标志情报局](https://www.logonews.cn/work/categorys/hotel-catering) 的 URL 为 `https://www.logonews.cn/work/categorys/hotel-catering`，可得路由为 [`/logonews/work/categorys/hotel-catering`](https://rsshub.app/logonews/work/categorys/hotel-catering)。',
};
