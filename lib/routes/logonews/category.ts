import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/category/:category/:type',
    categories: ['design'],
    example: '/logonews/category/news/newsletter',
    parameters: { category: '分类，可在对应分类页 URL 中找到', type: '类型，可在对应分类页 URL 中找到' },
    radar: [
        {
            source: ['logonews.cn/category/:category/:type?'],
            target: '/category/:category/:type?',
        },
    ],
    name: '文章分类',
    maintainers: ['nczitzk'],
    handler,
    url: 'logonews.cn/',
    description:
        '如 [简讯 - 标志情报局](https://www.logonews.cn/category/news/newsletter) 的 URL 为 `https://www.logonews.cn/category/news/newsletter`，可得路由为 [`/logonews/category/news/newsletter`](https://rsshub.app/logonews/category/news/newsletter)。',
};
