import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, getData, processItems } from './util';

export const route: Route = {
    path: ['/discover/:params?', '/:params?'],
    categories: ['new-media'],
    example: '/xinpianchang/discover',
    parameters: { params: '参数，可在对应分类页 URL 中找到，默认为 `article-0-0-all-all-0-0-score` ，即全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '发现',
    maintainers: ['nczitzk'],
    handler,
    description: `:::tip
  跳转到欲订阅的分类页，将 URL 的 \`/discover\` 到末尾的部分填入 \`params\` 参数。

  如 [全部原创视频作品](https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score) 的 URL 为 \`https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score\`，其 \`/discover\` 到末尾的部分为 \`article-0-0-all-all-0-0-score\`，所以对应的路由为 [/xinpianchang/discover/article-0-0-all-all-0-0-score](https://rsshub.app/xinpianchang/discover/article-0-0-all-all-0-0-score)。
  :::`,
};

async function handler(ctx) {
    const { params = 'article-0-0-all-all-0-0-score' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 60;

    const currentUrl = new URL(`discover/${params}`, rootUrl).href;

    const { data, response } = await getData(currentUrl, cache.tryGet);

    let items = JSON.parse(response.match(/"list":(\[.*?]),"total"/)[1]);

    items = await processItems(items.slice(0, limit), cache.tryGet);

    return {
        ...data,
        item: items,
    };
}
