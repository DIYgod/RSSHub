import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { handleSection, supportedSections } from './utils';

export const route: Route = {
    path: '/:id',
    name: '栏目',
    url: 'www.globalpeople.com.cn',
    categories: ['traditional-media'],
    example: '/globalpeople/305917',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    parameters: {
        id: '栏目 ID，当前已验证支持 `305917`（国内）和 `305916`（国际）',
    },
    radar: [
        {
            source: ['www.globalpeople.com.cn/305917/index.html'],
            target: '/305917',
        },
        {
            source: ['www.globalpeople.com.cn/305916/index.html'],
            target: '/305916',
        },
    ],
    maintainers: ['ZHA30'],
    handler,
};

function handler(ctx) {
    const id = ctx.req.param('id');

    if (!Object.hasOwn(supportedSections, id)) {
        throw new InvalidParameterError(`Unsupported section id: ${id}`);
    }

    return handleSection(ctx, id);
}
