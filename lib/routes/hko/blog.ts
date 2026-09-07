import type { Route } from '@/types';

import { createEditorialHandler, parameter } from './editorial';

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['blog'],
    example: '/hko/blog',
    parameters: parameter,
    radar: [{ source: ['www.hko.gov.hk/en/blog/index.htm'] }, { source: ['www.hko.gov.hk/tc/blog/index.htm'], target: '/blog/tc' }, { source: ['www.hko.gov.hk/sc/blog/index.htm'], target: '/blog/sc' }],
    name: "Observatory's Blog",
    maintainers: ['calpa'],
    url: 'www.hko.gov.hk/en/blog/index.htm',
    handler: createEditorialHandler({
        dataset: (year) => `https://www.hko.gov.hk/js/data/${year}_blog.js`,
        itemField: 'blog',
        dateField: 'blog_date',
        detailSelector: '.blog_container',
        removeParagraphs: 2,
        indexUrl: { en: '/en/blog/index.htm', tc: '/tc/blog/index.htm', sc: '/sc/blog/index.htm' },
        title: { en: "Observatory's Blog", tc: '天文台網誌', sc: '天文台网志' },
    }),
};
