import type { Context } from 'hono';

import type { Route } from '@/types';

import { getFeed, rootUrl } from './utils';

export const route: Route = {
    path: '/list/:id',
    categories: ['game'],
    example: '/gameres/list/26',
    parameters: { id: '列表 id' },
    description: `产业

| 厂商・专访 | 观察・投资 | 产品 | 政策 | 电子竞技 | 直播 | 区块链 |
| ---------- | ---------- | ---- | ---- | -------- | ---- | ------ |
| 1          | 11         | 6    | 45   | 14       | 42   | 41     |

平台

| 手游 | 页游・H5 | 端游・PC | 主机 | 虚拟・VR・AR | 云游戏 |
| ---- | -------- | -------- | ---- | ------------ | ------ |
| 5    | 17       | 18       | 21   | 16           | 48     |

研发

| 拆解分析 | 策划 | 程序・引擎 | 美术 | 音乐 | 测试 |
| -------- | ---- | ---------- | ---- | ---- | ---- |
| 24       | 25   | 26         | 27   | 28   | 29   |

市场

| 职场・创业 | 运营・渠道 | 海外 | 数据・报告 | App Store | Steam |
| ---------- | ---------- | ---- | ---------- | --------- | ----- |
| 38         | 34         | 47   | 33         | 46        | 40    |

其他

| 原创 | 硬件・周边 | 八卦 | 活动 | 综合 |
| ---- | ---------- | ---- | ---- | ---- |
| 43   | 44         | 15   | 22   | 39   |`,
    name: '列表',
    maintainers: ['nczitzk'],
    handler,
};

function handler(ctx: Context) {
    const { id } = ctx.req.param();

    return getFeed(`${rootUrl}/list/${id}`, '.feed-item-title');
}
