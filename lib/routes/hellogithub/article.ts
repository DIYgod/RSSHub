import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

const sorts = {
    hot: '热门',
    last: '最近',
};

export const route: Route = {
    path: '/article/:sort?',
    categories: ['programming'],
    example: '/hellogithub/article',
    parameters: { sort: '排序方式，见下表，默认为 `last`，即最近' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['moke8', 'nczitzk', 'CaoMeiYouRen'],
    handler,
    description: `| 热门 | 最近 |
| ---- | ---- |
| hot  | last |`,
};

async function handler(ctx) {
    const sort = ctx.req.param('sort') ?? 'last';
    if (!Object.hasOwn(sorts, sort)) {
        throw new InvalidParameterError(`Invalid sort: ${sort}. Supported sorts: ${Object.keys(sorts).join(', ')}.`);
    }
    const limit = getRouteLimit(ctx, 20);

    const rootUrl = 'https://hellogithub.com';
    const apiRootUrl = 'https://api.hellogithub.com/v1/article/';
    const currentUrl = `${rootUrl}/article/?sort_by=${sort}`;
    const apiUrl = `${apiRootUrl}?sort_by=${sort}&page=1`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.map((item) => ({
        title: item.title,
        description: `<figure>
  <img src="${item.head_image}">
</figure><br>${item.desc}`,
        link: `${rootUrl}/article/${item.aid}`,
        author: item.author,
        guid: item.aid,
        pubDate: item.publish_at ? parseDateInTimezone(item.publish_at, 8) : undefined,
    }));

    const sorted = ctx.req.query('sorted') !== 'false';
    const datesAvailable = items.every((item) => item.pubDate && Number.isFinite(item.pubDate.getTime()));
    const selectedItems = sorted && datesAvailable ? items.toSorted((a, b) => b.pubDate!.getTime() - a.pubDate!.getTime()).slice(0, limit) : items.slice(0, sorted ? Math.max(20, limit) : limit);

    return {
        title: `HelloGithub - ${sorts[sort]}文章`,
        link: currentUrl,
        item: selectedItems,
    };
}
