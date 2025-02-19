import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import utils from './utils';

export const route: Route = {
    path: '/tag/:tag/:type/:option?',
    categories: ['new-media', 'popular'],
    example: '/pingwest/tag/ChinaJoy/1',
    parameters: { tag: '话题名或话题id, 可从话题页url中得到', type: '内容类型', option: '参数, 默认无' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '话题动态',
    maintainers: ['sanmmm'],
    handler,
    description: `内容类型

| 最新 | 热门 |
| ---- | ---- |
| 1    | 2    |

  参数

  -   \`fulltext\`，全文输出，例如：\`/pingwest/tag/ChinaJoy/1/fulltext\`

::: tip
  该路由一次最多显示 30 条文章
:::`,
};

async function handler(ctx) {
    const { tag, type, option } = ctx.req.param();
    const needFullText = option === 'fulltext';

    const baseUrl = 'https://www.pingwest.com';
    const tagUrl = `${baseUrl}/tag/${tag}`;
    const { tagId, tagName } = await cache.tryGet(`pingwest:tag:${tag}`, async () => {
        const res = await got(tagUrl, {
            headers: {
                Referer: baseUrl,
            },
        });
        const $ = load(res.data);
        const tagId = $('.tag-detail').attr('data-id');
        const tagName = $('.tag-detail .info .title').text();
        return { tagId, tagName };
    });

    const url = `${baseUrl}/api/tag_article_list`;
    const response = await got(url, {
        searchParams: {
            id: tagId,
            type: type - 1,
        },
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = load(response.data.data.list);
    const items = await utils.articleListParser($, needFullText, cache);

    return {
        title: `品玩 - ${tagName}`,
        description: `品玩 - ${tagName}`,
        link: tagUrl,
        item: items,
    };
}
