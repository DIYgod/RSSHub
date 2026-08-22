import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cn/:category',
    categories: ['shopping'],
    example: '/mcdonalds/cn/sales+event',
    parameters: { category: '分类名（可用 + 连接多个分类）' },
    name: '麦当劳活动资讯',
    maintainers: ['huyyi'],
    description: `| 全部分类   | 社会责任       | 人员品牌 | 产品故事 | 优惠  | 品牌文化 | 活动速报 |
| ---------- | -------------- | -------- | -------- | ----- | -------- | -------- |
| news\\_list | responsibility | brand    | product  | sales | culture  | event    |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = 'news_list' } = ctx.req.param();
    const categories = category.split('+');
    const baseUrl = 'https://www.mcdonalds.com.cn/news/';

    const newsLists = await Promise.all(
        categories.map(async (cate) => {
            const response = await ofetch(baseUrl + cate);
            const $ = load(response);
            return $('.news_list .box-container > div')
                .slice(0, 10)
                .toArray()
                .map((item) => $(item).find('a[target]').attr('href'))
                .filter((href) => href !== undefined);
        })
    );

    const out = await Promise.all(
        newsLists.flat().map((newsUrl) =>
            cache.tryGet(newsUrl, async () => {
                const result = await ofetch(newsUrl);
                const $ = load(result);

                return {
                    title: $('h3').text(),
                    link: newsUrl,
                    pubDate: parseDate($('h3 ~ time').text()),
                    description: $('.cmsPage').html(),
                };
            })
        )
    );

    return {
        title: '麦当劳资讯',
        link: baseUrl,
        item: out,
    };
}
