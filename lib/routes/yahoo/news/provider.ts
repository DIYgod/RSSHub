import { Route } from '@/types';
import cache from '@/utils/cache';
import { getArchive, getProviderList, parseList, parseItem } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/news/provider/:region/:providerId',
    categories: ['new-media', 'popular'],
    example: '/yahoo/news/provider/tw/yahoo_tech_tw_942',
    parameters: { region: '地區, hk 或 tw, 分别表示香港雅虎和台湾雅虎', providerId: '新聞來源 ID, 可透過路由"新聞來源列表"獲得' },
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
            source: ['hk.news.yahoo.com/'],
        },
        {
            source: ['tw.news.yahoo.com/'],
        },
    ],
    name: '新聞來源',
    maintainers: ['TonyRL', 'williamgateszhao'],
    handler,
    description: `
\`Region\`

| 香港 | 台灣 |
| ---- | ---- |
| hk   | tw   |

\`ProviderId\`

除了可以通过路由"新聞來源列表"获得外, 也可通过 hk.news.yahoo.com/archive 和 tw.news.yahoo.com/archive 选择"新闻来源"后通过页面 Url 来获得。

例如 hk.news.yahoo.com/yahoo_movies_hk_660--所有分類/archive, \`yahoo_movies_hk_660\` 就是 ProviderId 。
`,
};

async function handler(ctx) {
    const { region, providerId } = ctx.req.param();
    if (!['hk', 'tw'].includes(region)) {
        throw new InvalidParameterError(`Unknown region: ${region}`);
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const providerList = await getProviderList(region, cache.tryGet);
    const provider = providerList.find((p) => p.key === providerId);

    const response = await getArchive(region, limit, null, providerId);
    const list = parseList(region, response);

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: `Yahoo 新聞 - ${provider?.title ?? ''}`,
        link: provider?.link ?? `https://${region}.news.yahoo.com`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
}
