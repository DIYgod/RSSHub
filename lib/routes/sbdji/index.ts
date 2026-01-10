import type { Route } from '@/types';
import cache from '@/utils/cache';

import { fetchArticle, fetchNewsList } from './utils';

const categories: Record<string, string> = {
    news: '新闻',
    jixu: '机讯',
    pingce: '评测',
    jiaocheng: '教程',
    jinfeitongzhi: '禁飞通知',
    gujiangengxin: '固件更新',
    'new-products': '新品',
    flysafe: '飞行安全',
    shiwuanli: '失误案例',
    sitemaster: '折腾',
    wuliao: '无聊',
    zhajihuishouzhan: '炸机回收站',
};

export const route: Route = {
    path: '/:category{[a-z-]+}?',
    categories: ['new-media'],
    example: '/sbdji',
    name: 'SBDJI',
    maintainers: ['spin6lock'],
    parameters: {
        category: Object.entries(categories)
            .map(([key, value]) => `| ${key} | ${value} |`)
            .join('\n'),
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `::: tip
  SBDJI (sbdji.cc) - 全球无人机资讯汇总，提供无人机行业新闻、新品发布、评测、教程等内容。
:::

  分类

| 参数值 | 分类名称 |
${Object.entries(categories)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join('\n')}
`,
    radar: [
        {
            source: ['sbdji.cc'],
            target: '/sbdji',
        },
    ],
    handler: async (ctx) => {
        const category = ctx.req.param('category') ?? 'news';
        const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

        const result = await fetchNewsList(category, limit);

        // Fetch full content for each article
        result.item = await Promise.all(
            result.item.map((item) =>
                cache.tryGet(`sbdji:article:${item.link}`, async () => {
                    const article = await fetchArticle(item.link);
                    return {
                        ...item,
                        description: article.description || item.description,
                    };
                })
            )
        );

        return result;
    },
};
