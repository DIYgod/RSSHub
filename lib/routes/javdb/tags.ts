import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/tags/:query?/:category?',
    categories: ['multimedia'],
    example: '/javdb/tags/c2=5&c10=1',
    parameters: { query: '筛选，默认为 `c10=1`', category: '分类，见下表，默认为 `有碼`' },
    features: {
        requireConfig: [
            {
                name: 'JAVDB_SESSION',
                description: 'JavDB登陆后的session值，可在控制台的cookie下查找 `_jdb_session` 的值，即可获取',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['javdb.com/'],
            target: '',
        },
    ],
    name: '分類',
    maintainers: ['nczitzk'],
    handler,
    url: 'javdb.com/',
    description: `:::tip
  在 [分類](https://javdb.com/tags) 中选定分类后，URL 中 \`tags?\` 后的字段即为筛选参数。

  如 \`https://javdb.com/tags?c2=5&c10=1\` 中 \`c2=5&c10=1\` 为筛选参数。
  :::

  分类

  | 有碼     | 無碼       | 歐美    |
  | -------- | ---------- | ------- |
  | censored | uncensored | western |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'censored';
    const query = ctx.req.param('query') ?? '';

    const currentUrl = `/tags${category === 'censored' ? '' : `/${category}`}?${query}`;

    const title = `JavDB${query === '' ? '' : ` - ${query}`} `;

    return await utils.ProcessItems(ctx, currentUrl, title);
}
