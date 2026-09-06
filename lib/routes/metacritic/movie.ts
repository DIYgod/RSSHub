import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/movie/:sort?/:filter?',
    categories: ['new-media'],
    example: '/metacritic/movie',
    parameters: {
        sort: 'Sort, see below, `new` for Newest Releases by default',
        filter: 'Filter',
    },
    description: `| Metascore | User Score | Most Popular | Newest Releases |
| --------- | ---------- | ------------ | --------------- |
| metascore | userscore  | popular      | new             |

::: tip
The Filter parameter comes from the corresponding page URL. The following is an example:

The URL of [Action Movies to Watch on Netflix](https://www.metacritic.com/browse/movie/all/all/all-time/new/?network=netflix\\&genre=action) is \`https://www.metacritic.com/browse/movie/all/all/all-time/new/?network=netflix&genre=action\`. The Filter parameter is \`network=netflix&genre=action\` and the route is [\`/metacritic/movie/new/network=netflix&genre=action\`](https://rsshub.app/metacritic/movie/new/network=netflix\\&genre=action)
:::`,
    radar: [
        {
            source: ['metacritic.com/browse/movie/*'],
            target: '/movie',
        },
    ],
    name: 'Movies',
    maintainers: ['nczitzk'],
    handler,
};
