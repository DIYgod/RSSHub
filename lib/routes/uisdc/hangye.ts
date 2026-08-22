import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/hangye/:caty?',
    categories: ['design'],
    example: '/uisdc/hangye',
    parameters: { caty: '分类，见下表，默认为全部新闻' },
    description: `| 全部新闻 | 活动赛事        | 品牌资讯   | 新品推荐     |
| -------- | --------------- | ---------- | ------------ |
|          | events-activity | brand-news | new-products |`,
    features: { antiCrawler: true },
    name: '行业新闻',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { caty = '' } = ctx.req.param();

    const rootUrl = 'https://www.uisdc.com';
    const currentUrl = `${rootUrl}/category/hangye${caty === '' ? '' : '/' + caty}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.hangye-list-item .hy-title a')
        .slice(0, 10)
        .toArray()
        .map((item) => ({
            link: $(item).attr('href') ?? '',
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                return {
                    title: content('.post-title').text().trim(),
                    link: item.link,
                    description: content('.article').html(),
                    pubDate: timezone(parseDate(content('.meta-time').attr('title')!), 8),
                };
            })
        )
    );

    return {
        title: `${$('.current').text()} - 优设网 - UISDC`,
        link: currentUrl,
        item: items,
    };
}
