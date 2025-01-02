import { Route } from '@/types';
import { processFeed } from './utils';

const handler = (ctx) => processFeed('tags', ctx);

export const route: Route = {
    path: '/tags/:type/:language?',
    name: '话题・标签',
    maintainers: ['AgFlore'],
    parameters: {
        type: '话题 ID，可从话题页 URL 中获取，如 `https://theinitium.com/tags/2019_10/`',
        language: '语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体',
    },
    radar: [
        {
            source: ['theinitium.com/tags/:type'],
            target: '/tags/:type',
        },
    ],
    handler,
    example: '/theinitium/tags/2019_10/zh-hans',
    categories: ['new-media', 'popular'],
};
