import { Route } from '@/types';
import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/ac/rank/:type?/:time?',
    categories: ['anime'],
    example: '/qq/ac/rank',
    parameters: { type: '分类，见下表，默认为月票榜', time: '时间，`cur` 为当周、`prev` 为上周' },
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
            source: ['ac.qq.com/Rank/comicRank/type/:type', 'ac.qq.com/'],
        },
    ],
    name: '排行榜',
    maintainers: ['nczitzk'],
    handler,
    description: `| 月票榜 | 飙升榜 | 新作榜 | 畅销榜 | TOP100 | 男生榜 | 女生榜 |
  | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
  | mt     | rise   | new    | pay    | top    | male   | female |

::: tip
  \`time\` 参数仅在 \`type\` 参数选为 **月票榜** 的时候生效。
:::`,
};

async function handler(ctx) {
    const titles = {
        mt: '月票榜',
        rise: '飙升榜',
        new: '新作榜',
        pay: '畅销榜',
        top: 'TOP100',
        male: '男生榜',
        female: '女生榜',
    };

    const type = ctx.req.param('type') ?? 'mt';
    const time = ctx.req.param('time') ?? 'cur';

    const currentUrl = `${rootUrl}/Rank/comicRank/type/${type}`;

    return await ProcessItems(ctx, currentUrl, time, titles[type]);
}
