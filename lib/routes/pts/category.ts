import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/category/:id',
    categories: ['traditional-media'],
    example: '/pts/category/9',
    parameters: { id: '分類 id，见下表，可在对应分類页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.pts.org.tw/category/:id', 'news.pts.org.tw/'],
        },
    ],
    description: `| 名称     | 编号 |
| -------- | ---- |
| 政治     | 1    |
| 社會     | 7    |
| 全球     | 4    |
| 生活     | 5    |
| 兩岸     | 9    |
| 地方     | 11   |
| 產經     | 10   |
| 文教科技 | 6    |
| 環境     | 3    |
| 社福人權 | 12   |`,
    name: '分類',
    maintainers: ['nczitzk'],
    handler,
};
