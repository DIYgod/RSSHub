import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { rootUrl, getData, processItems } from './util';

export const route: Route = {
    path: '/rank/:category?',
    categories: ['new-media'],
    example: '/xinpianchang/rank',
    parameters: { category: '分类 id，可在对应排行榜页 URL 中找到，见下表，默认为 `all` ，即总榜' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '排行榜',
    maintainers: ['nczitzk'],
    handler,
    description: `| 分类     | id         |
| -------- | ---------- |
| 总榜     | all        |
| 精选榜   | staffPicks |
| 广告     | ad         |
| 宣传片   | publicity  |
| 创意     | creative   |
| 干货教程 | backstage  |`,
};

async function handler(ctx) {
    const { category = 'all' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 60;

    const apiRankUrl = new URL(`api/xpc/v2/rank/${category}`, rootUrl).href;

    const { data: apiResponse } = await got(apiRankUrl);

    const current = apiResponse.data.list[0];
    const currentUrl = current.web_link;
    const currentName = `${current.code}-${current.year}-${current.index}`;

    const { data, response: currentResponse } = await getData(currentUrl, cache.tryGet);

    const buildId = currentResponse.match(/\/static\/(\w+)\/_buildManifest\.js/)[1];

    const apiUrl = new URL(`_next/data/${buildId}/rank/article/${currentName}.json`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    let items = response.pageProps.rankList;

    items = await processItems(items.slice(0, limit), cache.tryGet);

    return {
        ...data,
        item: items,
    };
}
