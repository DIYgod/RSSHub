import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/tv/:sort?/:filter?',
    categories: ['new-media'],
    example: '/metacritic/tv',
    parameters: {
        sort: 'Sort, see below, `new` for Newest Releases by default',
        filter: 'Filter',
    },
    description: `| Metascore | User Score | Most Popular | Newest Releases |
| --------- | ---------- | ------------ | --------------- |
| metascore | userscore  | popular      | new             |

::: tip
The Filter parameter comes from the corresponding page URL. The following is an example:

The URL of [Documentary TV Shows to Watch on Prime Video](https://www.metacritic.com/browse/tv/all/all/all-time/new/?network=prime-video\\&genre=documentary) is \`https://www.metacritic.com/browse/tv/all/all/all-time/new/?network=prime-video&genre=documentary\`. The Filter parameter is \`network=prime-video&genre=documentary\` and the route is [\`/metacritic/tv/new/network=prime-video&genre=documentary\`](https://rsshub.app/metacritic/tv/new/network=prime-video\\&genre=documentary)
:::`,
    radar: [
        {
            source: ['metacritic.com/browse/tv/*'],
            target: '/tv',
        },
    ],
    name: 'TV Shows',
    maintainers: ['nczitzk'],
    handler,
};
