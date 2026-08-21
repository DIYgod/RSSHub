import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    path: '/special/:id',
    parameters: { id: '分类 id，可在对应分类页 URL 中找到' },
    name: '专题',
    example: '/jiemian/special/1192',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
};
