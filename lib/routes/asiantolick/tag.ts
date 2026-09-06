import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/tag/:id',
    categories: ['picture'],
    example: '/asiantolick/tag/1045',
    parameters: {
        id: 'Tag id, can be found in URL',
    },
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['asiantolick.com/tag-:id'],
            target: '/tag/:id',
        },
    ],
    name: 'Tag',
    maintainers: ['nczitzk'],
    handler,
    url: 'asiantolick.com/',
    description: `| Aidol | Anal | Babe | Big Boobs | Big Pussy |
| ----- | ---- | ---- | --------- | --------- |
| 2310  | 2233 | 1385 | 1106      | 1722      |

| Bikini | Blonde | blowjob | Close Up | Creamy Pussy |
| ------ | ------ | ------- | -------- | ------------ |
| 1206   | 2244   | 2167    | 2267     | 1117         |

| cum  | Cute Girl | Dildo | Ebony | Feet |
| ---- | --------- | ----- | ----- | ---- |
| 2163 | 1090      | 1082  | 2245  | 1323 |

| fetish | fingers | Fox Tail | Glasses | Hairy Pussy |
| ------ | ------- | -------- | ------- | ----------- |
| 2219   | 2197    | 1540     | 1268    | 1099        |

| Interracial | Lesbian | licked | Loli | Maid |
| ----------- | ------- | ------ | ---- | ---- |
| 2284        | 1080    | 2208   | 1045 | 1072 |

| Masturbate | Milf | non-nude | Nude | Nurse |
| ---------- | ---- | -------- | ---- | ----- |
| 1081       | 1705 | 2307     | 1393 | 1552  |

| Office | oiled | Outdoor | Pink Pussy | Pink Tits |
| ------ | ----- | ------- | ---------- | --------- |
| 1724   | 2176  | 2250    | 1161       | 1498      |

| Public | School Girl | Short Hair | skirt | Small Girl |
| ------ | ----------- | ---------- | ----- | ---------- |
| 1277   | 1046        | 1160       | 2159  | 1103       |

| Socks | sucking | Tattoo | Teen | Tiny Tits |
| ----- | ------- | ------ | ---- | --------- |
| 2256  | 2199    | 1593   | 1036 | 2251      |

| Underwear | Uniform | wet  | Young |
| --------- | ------- | ---- | ----- |
| 1324      | 1084    | 2179 | 1098  |`,
};
