import type { Route } from '@/types';

import { handler } from './date';

export const route: Route = {
    path: '/date/:year/:month',
    categories: ['reading'],
    example: '/sobooks/date/2020/11',
    parameters: { year: '归档年份', month: '归档月份' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['sobooks.net/books/date/:year/:month'], target: '/date/:year/:month' },
        { source: ['sobooks.cc/books/date/:year/:month'], target: '/date/:year/:month' },
    ],
    name: '归档',
    maintainers: ['nczitzk'],
    handler,
};
