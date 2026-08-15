import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['design'],
    example: '/logonews/tag/china',
    parameters: { tag: '标签，可在对应标签页 URL 中找到' },
    radar: [
        {
            source: ['logonews.cn/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: '文章标签',
    maintainers: ['nczitzk'],
    handler,
    url: 'logonews.cn/',
    description: '如 [中国 - 标志情报局](https://www.logonews.cn/tag/china) 的 URL 为 `https://www.logonews.cn/tag/china`，可得路由为 [`/logonews/tag/china`](https://rsshub.app/logonews/tag/china)。',
};
