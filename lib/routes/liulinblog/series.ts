import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/series/:id',
    categories: ['new-media'],
    example: '/liulinblog/series/xunlei',
    parameters: { id: '专题 id，可在对应标签页 URL 中找到，见下表' },
    radar: [
        {
            source: ['liulinblog.com/series/:id', 'liulinblog.com/'],
            target: '/series/:id',
        },
    ],
    name: '专题',
    maintainers: ['nczitzk'],
    handler,
    description: `| 【免费速存】迅雷资源合集 | 直播带货教程 | 电商培训课程    | 拼多多运营培训 | 小红书运营  | 抖音运营      | 闲鱼运营      | 短视频运营        |
| ------------------------ | ------------ | --------------- | -------------- | ----------- | ------------- | ------------- | ----------------- |
| xunlei                   | zhibodaihuo  | dianshangpeixun | pinduoduo      | xiaohongshu | douyinyunying | xianyuyunying | duanshipinyunying |`,
};
