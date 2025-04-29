import { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    path: '/pro/lists/12',
    parameters: { id: '分类 id，见下表，可在对应分类页 URL 中找到' },
    name: 'VIP',
    example: '/jiemian/pro/lists/12',
    maintainers: ['nczitzk'],
    handler,
    description: `| [投资早晚报](https://www.jiemian.com/pro/lists/12.html) | [宏观晚 6 点](https://www.jiemian.com/pro/lists/20.html) | [打新早报](https://www.jiemian.com/pro/lists/21.html) | [盘前机会前瞻](https://www.jiemian.com/pro/lists/13.html) | [公告快评](https://www.jiemian.com/pro/lists/14.html) | [盘中必读](https://www.jiemian.com/pro/lists/15.html) |
| ------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| 12                                                      | 20                                                       | 21                                                    | 13                                                        | 14                                                    | 15                                                    |

| [金股挖掘](https://www.jiemian.com/pro/lists/16.html) | [调研早知道](https://www.jiemian.com/pro/lists/17.html) | [研报新知](https://www.jiemian.com/pro/lists/18.html) | [大势侦察](https://www.jiemian.com/pro/lists/1.html) | [市场风向标](https://www.jiemian.com/pro/lists/19.html) |
| ----------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| 16                                                    | 17                                                      | 18                                                    | 1                                                    | 19                                                      |
`,
};
