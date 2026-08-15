import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/:language?/tag/:id',
    categories: ['traditional-media'],
    example: '/aljazeera/english/tag/science-and-technology',
    parameters: {
        language: 'Language, see below, arabic by default, as Arabic',
        id: 'Tag id, can be found in URL',
    },
    description: `Language

| Arabic | Chinese | English |
| ------ | ------- | ------- |
| arabic | chinese | english |

::: tip
If you subscribe to [Al Jazeera English - Science and Technology](https://www.aljazeera.com/tag/science-and-technology), whose language is \`english\` and whose path is \`science-and-technology\`, you can get the route as [\`/aljazeera/english/tag/science-and-technology\`](https://rsshub.app/aljazeera/english/tag/science-and-technology)
:::`,
    radar: [
        {
            source: ['www.aljazeera.com/tag/:id', 'www.aljazeera.com/'],
            target: '/english/tag/:id',
        },
        {
            source: ['www.aljazeera.net/tag/:id', 'www.aljazeera.net/'],
            target: '/arabic/tag/:id',
        },
        {
            source: ['chinese.aljazeera.net/tag/:id', 'chinese.aljazeera.net/'],
            target: '/chinese/tag/:id',
        },
    ],
    name: 'Tag',
    maintainers: ['nczitzk'],
    handler,
};
