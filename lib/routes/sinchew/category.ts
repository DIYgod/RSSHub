import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/category/:category{.+}?',
    categories: ['traditional-media'],
    example: '/sinchew/category/头条',
    parameters: { category: '分类，见下表，亦可以在对应分类页 URL 中找到' },
    radar: [
        {
            source: ['sinchew.com.my/category/:category', 'sinchew.com.my/'],
            target: '/category/:category',
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    description: `| 头条 | 国内 | 国际 | 言路 | 财经 | 地方 | 副刊 | 娱乐 | 体育 | 百格 | 星角攝 | 好运来 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ------ |

::: tip
若订阅单级分类 [头条](https://www.sinchew.com.my/category/头条)，其 URL 为 [https://www.sinchew.com.my/category/ 头条](https://www.sinchew.com.my/category/头条)，则路由为 [\`/sinchew/category/头条\`](https://rsshub.app/sinchew/category/头条)。

若订阅多级分类 [国际 > 天下事](https://www.sinchew.com.my/category/国际/天下事)，其 URL 为 [https://www.sinchew.com.my/category/ 国际 / 天下事](https://www.sinchew.com.my/category/国际/天下事)，则路由为 [\`/sinchew/category/国际/天下事\`](https://rsshub.app/sinchew/category/国际/天下事)。
:::`,
    handler,
};
