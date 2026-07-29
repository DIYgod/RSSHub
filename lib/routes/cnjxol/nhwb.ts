import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/nhwb/:id?',
    categories: ['traditional-media'],
    example: '/cnjxol/nhwb',
    parameters: { id: '编号，见下表，默认为全部' },
    radar: [
        {
            source: ['cnjxol.com/'],
            target: '/nhwb/:id',
        },
    ],
    description: `| 版                                   | 编号 |
| ------------------------------------ | ---- |
| 全部                                 |      |
| 第 01 版：要闻                       | 01   |
| 第 02 版：品质嘉兴・红船旁的美丽城镇 | 02   |
| 第 03 版：嘉兴新闻                   | 03   |
| 第 04 版：嘉兴新闻                   | 04   |
| 第 05 版：今日聚焦                   | 05   |
| 第 06 版：嘉兴新闻                   | 06   |
| 第 07 版：热线新闻                   | 07   |
| 第 08 版：财经新闻                   | 08   |
| 第 09 版：热线新闻                   | 09   |
| 第 10 版：公益广告                   | 10   |
| 第 11 版：消费周刊                   | 11   |
| 第 12 版：悦读坊                     | 12   |`,
    features: {
        antiCrawler: true,
    },
    name: '南湖晚报',
    maintainers: ['nczitzk'],
    handler,
};
