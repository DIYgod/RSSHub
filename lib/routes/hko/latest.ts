import type { Route } from '@/types';

import { createEditorialHandler, parameter } from './editorial';

export const route: Route = {
    path: '/latest/:lang?',
    categories: ['government'],
    example: '/hko/latest',
    parameters: parameter,
    radar: [{ source: ['www.hko.gov.hk/en/whatsnew/index.htm'] }, { source: ['www.hko.gov.hk/tc/whatsnew/index.htm'], target: '/latest/tc' }, { source: ['www.hko.gov.hk/sc/whatsnew/index.htm'], target: '/latest/sc' }],
    name: 'Latest News',
    maintainers: ['calpa'],
    url: 'www.hko.gov.hk/en/whatsnew/index.htm',
    handler: createEditorialHandler({
        dataset: (year) => `https://www.hko.gov.hk/js/data/${year}_news.js`,
        itemField: 'news',
        dateField: 'whatsnew_date',
        detailSelector: '.whats_new_container',
        removeParagraphs: 1,
        indexUrl: { en: '/en/whatsnew/index.htm', tc: '/tc/whatsnew/index.htm', sc: '/sc/whatsnew/index.htm' },
        title: { en: "What's New", tc: '最新消息', sc: '最新消息' },
    }),
};
