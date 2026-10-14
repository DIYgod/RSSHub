import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const typeMap = {
    '5': '全部公告',
    '19': '产品发布',
    '21': '规则变更',
    '20': '维护公告',
    '22': '其他公告',
};

export const route: Route = {
    path: '/docs/:dirId?',
    categories: ['programming'],
    example: '/jinritemai/docs/19',
    parameters: { dirId: '公告分类, 可在页面URL获取 默认为全部' },
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
    description: `| 类型     | type |
| -------- | ---- |
| 全部公告 | 5    |
| 产品发布 | 19   |
| 规则变更 | 21   |
| 维护公告 | 20   |
| 其他公告 | 22   |`,
};

async function handler(ctx) {
    const dirId = ctx.req.param('dirId') || '5';
    const url = `https://op.jinritemai.com/doc/external/open/queryDocArticleList?pageIndex=0&pageSize=10&status=1&dirId=${dirId}&orderType=3`;
    const response = await got({ method: 'get', url });

    const list = response.data.data.articles.map((item) => ({
        title: item.title,
        id: String(item.id),
        category: item.dirName ? [item.dirName] : undefined,
        link: `https://op.jinritemai.com/docs/notice-docs/${dirId}/${item.id}`,
        pubDate: parseTimestamp(item.createTime),
        updated: parseTimestamp(item.updateTime),
    }));

    const result = await Promise.all(
        list.map(async (item) => {
            const description = await cache.tryGet(`${item.link}:description`, async () => {
                const itemResponse = await got({
                    method: 'get',
                    url: `https://op.jinritemai.com/doc/external/open/queryDocArticleDetail?articleId=${item.id}&onlyView=false`,
                });
                return itemResponse.data.data.article.content;
            });
            return { ...item, description };
        })
    );

    return {
        title: `抖店开放平台 - ${typeMap[dirId] ?? '平台公告'}`,
        link: `https://op.jinritemai.com/docs/notice-docs/${dirId}`,
        item: result,
    };
}

function parseTimestamp(value?: number): Date | undefined {
    const date = typeof value === 'number' ? parseDate(value, 'X') : undefined;
    return date && Number.isFinite(date.getTime()) ? date : undefined;
}
