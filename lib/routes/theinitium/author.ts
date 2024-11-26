import { Route } from '@/types';
import { processFeed } from './utils';

const handler = (ctx) => processFeed('author', ctx);

export const route: Route = {
    path: '/author/:type/:language?',
    name: '作者',
    maintainers: ['AgFlore'],
    parameters: {
        type: '作者 ID，可从作者主页 URL 中获取，如 `https://theinitium.com/author/ninghuilulu`',
        language: '语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体',
    },
    radar: [
        {
            source: ['theinitium.com/author/:type'],
            target: '/author/:type',
        },
    ],
    handler,
    example: '/theinitium/author/ninghuilulu/zh-hans',
    categories: ['new-media', 'popular'],
};
