import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const typeMap = {
    '1010580020': '技术变更',
    '1014821004': '服务市场规则中心',
    '1011202692': '规则变更',
    '1010568195': '维护公告',
};

/**
 *
 * @param ctx {import('koa').Context}
 */
export const route: Route = {
    path: '/declaration/:categoryId?',
    categories: ['programming'],
    example: '/dewu/declaration/1010580020',
    parameters: { categoryId: '公告分类, 可在页面URL获取 默认为1010580020' },
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
    description: `| 类型             | type       |
  | ---------------- | ---------- |
  | 技术变更         | 1010580020 |
  | 服务市场规则中心 | 1014821004 |
  | 规则变更         | 1011202692 |
  | 维护公告         | 1010568195 |`,
};

async function handler(ctx) {
    const categoryId = ctx.req.param('categoryId') || '1010580020';
    const response = await got({
        method: 'post',
        url: 'https://open.dewu.com/api/v1/h5/merchant-study/open/document/listDocument',
        headers: {
            'Content-Type': 'application/json',
        },
        json: {
            categoryId,
        },
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        id: item.id,
        link: `https://open.dewu.com/#/declaration/read?articleId=${item.id}`,
        pubDate: timezone(parseDate(item.publishTime), +8),
    }));

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemResponse = await got({
                    method: 'post',
                    url: 'https://open.dewu.com/api/v1/h5/merchant-study/open/document/getDocumentDetail',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    json: {
                        documentId: item.id,
                    },
                });
                item.description = itemResponse.data.data.content;
                return item;
            })
        )
    );

    return {
        title: `得物开放平台 - ${typeMap[categoryId] ?? '平台公告'}`,
        link: 'https://open.dewu.com/#/declaration/read',
        item: result,
    };
}
