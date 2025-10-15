import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/rankings/:category?/:time?',
    categories: ['multimedia'],
    example: '/javdb/rankings',
    parameters: { category: '分类，见下表，默认为 `有碼`', time: '时间，见下表，默认为 `日榜`' },
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
        nsfw: true,
    },
    radar: [
        {
            source: ['javdb.com/'],
            target: '',
        },
    ],
    name: '排行榜',
    maintainers: ['nczitzk'],
    handler,
    url: 'javdb.com/',
    description: `分类

| 有碼     | 無碼       | 歐美    |
| -------- | ---------- | ------- |
| censored | uncensored | western |

  时间

| 日榜  | 週榜   | 月榜    |
| ----- | ------ | ------- |
| daily | weekly | monthly |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'censored';
    const time = ctx.req.param('time') ?? 'daily';

    const currentUrl = `/rankings/movies?p=${time}&t=${category}`;

    const title = 'JavDB';

    return await utils.ProcessItems(ctx, currentUrl, title);
}
