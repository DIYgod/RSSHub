import type { Route } from '@/types';
import { ViewType } from '@/types';

import { getArticleItems, rootUrl } from './utils';

export const route: Route = {
    path: '/featured/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/techflowpost/featured',
    parameters: {
        category: '分类，见下表，默认为全部',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['techflowpost.com/zh-CN/article'],
        },
    ],
    name: '精选',
    maintainers: ['zhenlohuang'],
    handler,
    url: 'techflowpost.com/zh-CN/article',
    description: `| 全部 | 行业 & 项目观察 | 项目简介 | 项目动态 | 赛道解读 | 播客笔记 | 交易观察 | VC 洞察 | 实用教程 | 人物故事 & 访谈 | 法律 & 监管动态 | 活动动态 | 交易所动态 |
| ---- | --------------- | -------- | -------- | -------- | -------- | -------- | ------- | -------- | --------------- | --------------- | -------- | ---------- |
|      | 2040            | 2046     | 2047     | 2045     | 2044     | 2043     | 2042    | 2041     | 2039            | 2033            | 2032     | 2031       |`,
};

const categoryMap: Record<string, string> = {
    '2040': '行业 & 项目观察',
    '2046': '项目简介',
    '2047': '项目动态',
    '2045': '赛道解读',
    '2044': '播客笔记',
    '2043': '交易观察',
    '2042': 'VC洞察',
    '2041': '实用教程',
    '2039': '人物故事 & 访谈',
    '2033': '法律 & 监管动态',
    '2032': '活动动态',
    '2031': '交易所动态',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const limit = ctx.req.query('limit') ?? 50;
    const currentUrl = `${rootUrl}/zh-CN/article`;
    const items = await getArticleItems({
        category,
        limit,
    });

    const categoryName = category && categoryMap[category] ? `（${categoryMap[category]}）` : '';

    return {
        title: `深潮TechFlow - 精选文章${categoryName}`,
        link: currentUrl,
        item: items,
    };
}
