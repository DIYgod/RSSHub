import type { Route } from '@/types';
import cache from '@/utils/cache';

import { fetchItems, rootUrl } from './util';

export const route: Route = {
    path: '/class/:category?',
    categories: ['reading'],
    example: '/56kog/class/1_1',
    parameters: { category: '分类，见下表，默认为玄幻魔法' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| [玄幻魔法](https://www.56kog.com/class/1_1.html) | [武侠修真](https://www.56kog.com/class/2_1.html) | [历史军事](https://www.56kog.com/class/4_1.html) | [侦探推理](https://www.56kog.com/class/5_1.html) | [网游动漫](https://www.56kog.com/class/6_1.html) |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| 1_1                                             | 2_1                                             | 4_1                                             | 5_1                                             | 6_1                                             |

| [恐怖灵异](https://www.56kog.com/class/8_1.html) | [都市言情](https://www.56kog.com/class/3_1.html) | [科幻](https://www.56kog.com/class/7_1.html) | [女生小说](https://www.56kog.com/class/9_1.html) | [其他](https://www.56kog.com/class/10_1.html) |
| ------------------------------------------------ | ------------------------------------------------ | -------------------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| 8_1                                             | 3_1                                             | 7_1                                         | 9_1                                             | 10_1                                         |`,
};

async function handler(ctx) {
    const { category = '1_1' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`class/${category}.html`, rootUrl).href;

    return await fetchItems(limit, currentUrl, cache.tryGet);
}
