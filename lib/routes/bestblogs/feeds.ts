import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/feeds/:category?',
    categories: ['programming'],
    example: '/bestblogs/feeds/featured',
    parameters: { category: 'the category of articles. Can be `programming`, `ai`, `product`, `business` or `featured`. Default is `featured`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章列表',
    maintainers: ['zhenlohuang'],
    handler,
};

async function handler(ctx) {
    const { category = 'featured' } = ctx.req.param();
    const rootUrl = 'https://www.bestblogs.dev';
    let categoryCode = '';
    if (category !== 'featured') {
        const categories = await ofetch(`${rootUrl}/api/proxy/categories`);
        categoryCode = categories.data.find((item) => item.alias === category)?.code || category;
    }
    const response = await ofetch(`${rootUrl}/api/proxy/resources`, {
        query: {
            type: 'ARTICLE',
            page: 1,
            pageSize: getRouteLimit(ctx, 100),
            category: categoryCode,
            qualifiedFilter: category === 'featured' ? 'true' : 'false',
            timeFilter: '1w',
            language: 'all',
            uiLang: 'zh',
            sortType: 'default',
        },
    });

    if (!response.success || !response.data?.dataList) {
        throw new Error(`Invalid Bestblogs API response: ${response.message || 'missing article list'}`);
    }
    const items = response.data.dataList.map((article) => ({
        title: article.title,
        link: article.url,
        description: article.summary,
        pubDate: article.publishTimeStamp ? parseDate(article.publishTimeStamp) : undefined,
        author: article.authors?.map((name) => ({ name })),
        category: article.category,
    }));

    return {
        title: 'Bestblogs.dev',
        link: `${rootUrl}/explore?type=article`,
        item: items,
    };
}
