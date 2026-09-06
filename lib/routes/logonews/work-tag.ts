import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/work/tags/:tag?',
    categories: ['design'],
    example: '/logonews/work/tags/旅游',
    parameters: { tag: '标签，可在对应标签页 URL 中找到' },
    radar: [
        {
            source: ['logonews.cn/work/tags/:tag'],
            target: '/work/tags/:tag',
        },
    ],
    name: '作品标签',
    maintainers: ['nczitzk'],
    handler,
    url: 'logonews.cn/',
    description:
        '如 [LOGO 标签：旅游 - 标志情报局](https://www.logonews.cn/work/tags/旅游) 的 URL 为 [https://www.logonews.cn/work/tags/ 旅游](https://www.logonews.cn/work/tags/旅游)，可得路由为 [`/logonews/work/tags/旅游`](https://rsshub.app/logonews/work/tags/旅游)。',
};
