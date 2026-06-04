import type { Route } from '@/types';

import { handler } from './common';

export const route: Route = {
    name: 'News',
    maintainers: ['Rjnishant530'],
    path: ['/:category'],
    example: '/dnaindia/headlines',
    parameters: {
        category: 'Find it in the URL, or tables below',
    },
    radar: [
        {
            source: ['www.dnaindia.com/:category'],
        },
    ],
    handler,
    url: 'www.dnaindia.com',
    description: `Categories:

| Headlines | Explainer | India | Entertainment | Sports | Viral | Lifestyle | Education | Business | World |
| --------- | --------- | ----- | ------------- | ------ | ----- | --------- | --------- | -------- | ----- |
| headlines | explainer | india | entertainment | sports | viral | lifestyle | education | business | world |`,
};
