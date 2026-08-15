import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/topic/:id',
    categories: ['new-media'],
    example: '/8world/topic/xianggang-3',
    parameters: { id: '标签 id，可在对应标签页中找到' },
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
};
