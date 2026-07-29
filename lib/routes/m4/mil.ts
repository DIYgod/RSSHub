import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/mil/:category?',
    categories: ['new-media'],
    example: '/m4/mil/china',
    parameters: { category: '分类，见下表，默认为中国军情' },
    description: `| 分类                                  | ID      |
| ------------------------------------- | ------- |
| [中国军情](http://mil.m4.cn/china/)   | china   |
| [国际军情](http://mil.m4.cn/world/)   | world   |
| [军事评论](http://mil.m4.cn/views/)   | views   |
| [军事历史](http://mil.m4.cn/history/) | history |
| [军迷说](http://mil.m4.cn/talk/)      | talk    |
| [武器库](http://mil.m4.cn/arms/)      | arms    |`,
    radar: [
        {
            source: ['mil.m4.cn/:category', 'mil.m4.cn/'],
            target: '/mil/:category',
        },
    ],
    name: '军事',
    maintainers: ['nczitzk'],
    handler,
    url: 'mil.m4.cn',
};
