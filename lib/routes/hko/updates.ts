import type { Route } from '@/types';

import { createEditorialHandler, parameter } from './editorial';

export const route: Route = {
    path: '/updates/:lang?',
    categories: ['government'],
    example: '/hko/updates',
    parameters: parameter,
    radar: [{ source: ['www.hko.gov.hk/en/hkonews/index.htm'] }, { source: ['www.hko.gov.hk/tc/hkonews/index.htm'], target: '/updates/tc' }, { source: ['www.hko.gov.hk/sc/hkonews/index.htm'], target: '/updates/sc' }],
    name: 'HKO Updates',
    maintainers: ['calpa'],
    url: 'www.hko.gov.hk/en/hkonews/index.htm',
    handler: createEditorialHandler({
        dataset: (year) => `https://www.hko.gov.hk/js/data/${year}_sidelights.js`,
        itemField: 'sidelights',
        dateField: 'sidelights_date',
        detailSelector: '.news_container',
        removeParagraphs: 1,
        indexUrl: { en: '/en/hkonews/index.htm', tc: '/tc/hkonews/index.htm', sc: '/sc/hkonews/index.htm' },
        title: { en: 'HKO Updates', tc: '天文台最新動態', sc: '天文台最新动态' },
    }),
};
