import { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    path: '/account/main/1',
    parameters: { id: '分类 id，见下表，可在对应分类页 URL 中找到' },
    name: '界面号',
    example: '/jiemian/account/main/1',
    maintainers: ['nczitzk'],
    handler,
    description: `| [财经号](https://www.jiemian.com/account/main/1.html) | [城市号](https://www.jiemian.com/account/main/2.html) | [媒体号](https://www.jiemian.com/account/main/3.html) |
| ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| 1                                                     | 2                                                     | 3                                                     |
`,
};
