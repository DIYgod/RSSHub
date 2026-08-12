import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/notice/:type?',
    categories: ['government'],
    example: '/gov/ccgp-hunan/notice/采购公告',
    parameters: {
        type: {
            description: '分类名称',
            default: '项目信息',
            options: [
                '项目信息',
                '征求意见',
                '采购意向公开',
                '单一来源公示',
                '采购公告',
                '中标(成交)公告',
                '废标(终止)公告',
                '合同公告',
                '履约验收公告',
                '更正公告',
                '资格预审公告',
                '框架协议公告',
                '征集公告',
                '入围结果公告',
                '成交结果单笔公告',
                '成交结果汇总公告',
                '退出公告',
            ].map((name) => ({ value: name, label: name })),
        },
    },
    name: '政府采购网 - 公告',
    maintainers: ['Jeason0228'],
    handler,
};

const rootUrl = 'http://www.ccgp-hunan.gov.cn';

const flatten = (nodes) => nodes.flatMap((node) => [{ name: node.name, code: node.code }, ...flatten(node.children)]);

async function handler(ctx: Context) {
    const { type = '项目信息' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 15;

    const categories = (await cache.tryGet('ccgp-hunan:categories', async () => {
        const response = await ofetch(`${rootUrl}/admin/category/home/categoryTreeFind?parentId=622707&siteId=160`);
        return flatten(response.result.data);
    })) as Array<{ name: string; code: string }>;

    const category = categories.find((c) => c.name === type);
    if (!category) {
        throw new InvalidParameterError(`未知的公告类型：${type}，可用分类：${categories.map((c) => c.name).join('、')}`);
    }

    const response = await ofetch(`${rootUrl}/portal/category`, {
        method: 'POST',
        body: {
            pageNo: 1,
            pageSize: limit,
            categoryCode: category.code,
            districtCode: ['430000'],
            isProvince: true,
        },
    });

    const list = response.result.data.data.map((row) => ({
        title: row.title,
        link: `${rootUrl}/luban/front/detail?parentId=622707&articleId=${row.articleId}`,
        author: row.author,
        guid: row.articleId,
        category: row.pathName,
        pubDate: parseDate(row.publishDate),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch(`${rootUrl}/portal/detail?articleId=${encodeURIComponent(item.guid)}`);
                item.description = detail.result.data.content;
                return item;
            })
        )
    );

    return {
        title: `湖南省政府采购网 - ${category.name}`,
        link: `${rootUrl}/luban/front/category?districtCode=430000&isProvince=true&parentId=622707`,
        description: '湖南省政府采购网',
        item: items,
    };
}
