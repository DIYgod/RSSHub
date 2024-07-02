import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

/**
 *
 * @param ctx {import('koa').Context}
 */
export const route: Route = {
    path: '/jos/platformlist/:listId?',
    categories: ['programming'],
    example: '/jd/jos/platformlist/328',
    parameters: { listId: '公告分类, 可在页面URL获取' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '平台公告',
    maintainers: ['blade0910'],
    handler,
    description: `| 类型        | type       |
  | ---------- | ---------- |
  | 所有公告    |            |
  | 产品发布    | 328        |
  | 维护公告    | 329        |
  | 技术升级    | 330        |
  | 活动公告    | 332        |
  | 其他公告    | 327        |`,
};

async function handler(ctx) {
    const listId = ctx.req.param('listId') || '';
    const url = `https://joshome.jd.com/doc/getNewJosChannelInfo?channelId=${listId}&pageIndex=1&pageSize=20`;
    const response = await got({ method: 'get', url });

    const channels = {};
    if (response.data.data.josCmsChannels) {
        for (const item of response.data.data.josCmsChannels) {
            channels[item.id] = item.channelName;
        }
    }

    const list = response.data.data.josCmsArticle.map((item) => ({
        title: item.articleTitle,
        id: item.id,
        link: `https://jos.jd.com/platformdetail?listId=${listId}&itemId=${item.id}`,
        pubDate: parseDate(item.created),
    }));

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const url = `https://joshome.jd.com/doc/getArticleDetailInfo?articleId=${item.id}`;
                const itemResponse = await got({ method: 'get', url });
                item.description = itemResponse.data.data.articleContent;
                return item;
            })
        )
    );

    return {
        title: `宙斯开发者中心 - ${channels[listId] ?? '所有公告'}`,
        link: `https://jos.jd.com/platformlist?listId=${listId}`,
        item: result,
    };
}
