import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/fxrw/:id/:category',
    name: '任务动态',
    example: '/gov/cmse/fxrw/wtfx/rwdt',
    parameters: {
        id: '任务 id，可在对应任务页 URL 中找到',
        category: '分类 id，见下表，可在对应任务页 URL 中找到',
    },
    description: `::: tip

下表分类可能并不完整。请查看各飞行任务详情页获得完整分类。

:::

| 任务动态 | 综合新闻 | 视频 | 图片新闻 | 媒体聚焦 |
| -------- | -------- | ---- | -------- | -------- |
| rwdt     | zhxw     | sp   | tpxw     | mtjj     |`,
    radar: [
        {
            source: ['www.cmse.gov.cn/fxrw/:id/:category'],
        },
    ],
    maintainers: ['nczitzk'],
    handler,
};
