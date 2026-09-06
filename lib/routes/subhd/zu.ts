import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/zu/:category?',
    categories: ['multimedia'],
    example: '/subhd/zu/14',
    parameters: { category: '字幕组，见下表，默认为 YYeTs字幕组' },
    radar: [
        {
            source: ['subhd.tv/zu/:category', 'subhd.tv/'],
            target: '/zu/:category?',
        },
    ],
    name: '字幕组',
    description: `| YYeTs 字幕组 | F.I.X 字幕侠 | 深影字幕组 | 擦枪字幕组 | 哒哒字幕组 | 迪幻字幕组 | 伊甸园字幕组 | H-SGDK 字幕组 | 蓝血字幕组 | GA 字幕组 | CC 标准电影字幕组 | NEW 字幕组 | Orange 字幕组 | 圣城家园 SCG 字幕组 | 纪录片之家字幕组 |
| ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ------------ | ------------- | ---------- | --------- | ----------------- | ---------- | ------------- | ------------------- | ---------------- |
| 14           | 28           | 2          | 118        | 132        | 20         | 1            | 18            | 71         | 11        | 75                | 130        | 66            | 19                  | 10               |`,
    maintainers: ['nczitzk'],
    handler,
};
