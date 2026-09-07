import type { Route } from '@/types';

import { createEditorialHandler } from './editorial';

export const route: Route = {
    path: '/notes/:lang?',
    categories: ['forecast'],
    example: '/hko/notes',
    parameters: {
        lang: {
            description: 'Language',
            options: [
                { value: 'en', label: 'English' },
                { value: 'tc', label: '繁體中文' },
                { value: 'sc', label: '简体中文' },
            ],
            default: 'tc',
        },
    },
    radar: [{ source: ['www.hko.gov.hk/tc/forecaster_blog/index.htm'] }, { source: ['www.hko.gov.hk/sc/forecaster_blog/index.htm'], target: '/notes/sc' }],
    name: 'Weather Notes',
    maintainers: ['calpa'],
    url: 'www.hko.gov.hk/tc/forecaster_blog/index.htm',
    handler: createEditorialHandler(
        {
            dataset: () => 'https://www.hko.gov.hk/js/data/forecaster.js',
            itemField: 'forecaster',
            dateField: 'forecaster_date',
            detailSelector: '.forecaster_blog',
            removeParagraphs: 1,
            indexUrl: { en: '/en/forecaster_blog/index.htm', tc: '/tc/forecaster_blog/index.htm', sc: '/sc/forecaster_blog/index.htm' },
            title: { en: 'Weather Notes', tc: '天氣隨筆', sc: '天气随笔' },
        },
        'tc'
    ),
};
