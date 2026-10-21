import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/',
    categories: ['finance'],
    example: '/cbnweek',
    radar: [
        {
            source: ['cbnweek.com/'],
            target: '',
        },
    ],
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    url: 'cbnweek.com/',
};

async function handler(ctx) {
    const rootUrl = 'https://www.cbnweek.com';
    const apiRootUrl = 'https://api.cbnweek.com';
    const limit = getRouteLimit(ctx, 1);
    const currentUrl = `${apiRootUrl}/v5/first_page_infos?per=${limit}&page=1`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data.data.slice(0, limit).map((item) => {
        const post = item.data[0];
        return {
            guid: post.id,
            title: post.title,
            link: `${rootUrl}/article-detail/${post.id}`,
            pubDate: parseDate(post.display_time),
            author: post.authors?.map((a) => a.name).join(', '),
            category: post.topics?.map((t) => t.name),
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${apiRootUrl}/v5/articles/${item.guid}`,
                });

                const detail = detailResponse.data.data;
                item.description = detail.content;
                item.author = detail.authors?.map((a) => a.name).join(', ');
                item.category = detail.topics?.map((t) => t.name);

                return item;
            })
        )
    );

    return {
        title: '第一财经杂志',
        link: rootUrl,
        item: items,
    };
}
