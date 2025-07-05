import { Route } from '@/types';
import { processFeed } from './utils';

const handler = (ctx) => processFeed('channel', ctx);

export const route: Route = {
    path: '/channel/:type?/:language?',
    name: '专题・栏目',
    maintainers: ['prnake', 'mintyfrankie'],
    parameters: {
        type: '栏目，缺省为最新',
        language: '语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体',
    },
    radar: [
        {
            source: ['theinitium.com/channel/:type'],
            target: '/channel/:type',
        },
    ],
    handler,
    example: '/theinitium/channel/latest/zh-hans',
    categories: ['new-media'],
    description: `Type 栏目：

| 最新   | 深度    | What’s New | 广场              | 科技       | 风物    | 特约     | ... |
| ------ | ------- | ---------- | ----------------- | ---------- | ------- | -------- | --- |
| latest | feature | news-brief | notes-and-letters | technology | culture | pick_up | ... |`,
};
