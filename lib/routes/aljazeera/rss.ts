import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/:language?/rss',
    categories: ['traditional-media'],
    example: '/aljazeera/english/rss',
    parameters: {
        language: 'Language, see below, arabic by default, as Arabic',
    },
    description: `Language

| Arabic | English |
| ------ | ------- |
| arabic | english |`,
    radar: [
        {
            source: ['www.aljazeera.com/xml/rss/all.xml', 'www.aljazeera.com/'],
            target: '/english/rss',
        },
        {
            source: ['www.aljazeera.net/rss', 'www.aljazeera.net/'],
            target: '/arabic/rss',
        },
    ],
    name: 'Official RSS',
    maintainers: ['nczitzk'],
    handler,
};
