import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

/**
 *
 * @param ctx {import('koa').Context}
 */
export const route: Route = {
    path: '/open/announcement/:listId?',
    categories: ['programming'],
    example: '/jd/open/announcement/851',
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
  | 产品发布    | 851        |
  | 升级维护    | 546        |
  | 技术变更    | 547        |
  | 安全公告    | 1018       |
  | 活动公告    | 1020       |
  | 其他公告    | 1019       |`,
};

async function handler(ctx) {
    const listId = ctx.req.param('listId') || '';
    const url = `https://open.jd.com/bffapi/doc/getNewJosChannelInfo?channelId=${listId}&pageIndex=1`;
    const response = await got({ method: 'get', url });

    const channels = {};
    if (response.data.responseData.josCmsChannels) {
        for (const item of response.data.responseData.josCmsChannels) {
            channels[item.id] = item.channelName;
        }
    }

    const list = response.data.responseData.josCmsArticle.map((item) => ({
        title: item.articleTitle,
        id: item.id,
        link: `https://open.jd.com/home/home/#/announcement/detail?listId=${listId}&itemId=${item.id}`,
        pubDate: timezone(parseDate(item.modified), +8),
    }));

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const url = `https://open.jd.com/bffapi/doc/getArticleDetailInfo?articleId=${item.id}`;
                const itemResponse = await got({ method: 'get', url });
                item.description = itemResponse.data.responseData.articleContent;
                return item;
            })
        )
    );

    return {
        title: `京东商家开放平台 - ${channels[listId] ?? '所有公告'}`,
        link: `https://open.jd.com/home/home/#/announcement/index?listId=${listId}`,
        item: result,
    };
}
