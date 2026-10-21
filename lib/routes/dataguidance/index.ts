import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    name: 'News',
    description: 'Articles requiring a subscription are limited to the public preview returned by the source.',
    example: '/dataguidance/news',
    path: '/news',
    radar: [
        {
            source: ['www.dataguidance.com/info'],
        },
    ],
    maintainers: ['harveyqiu'],
    handler,
    url: 'https://www.dataguidance.com/info?article_type=news_post',
};

async function handler(ctx) {
    const rootUrl = 'https://www.dataguidance.com';
    const url = 'https://www.dataguidance.com/api/v1/kb/content/articles?news_types=510&news_types=511&news_types=512&news_types=513&order=DESC_publishedOn&limit=25&article_types=news_post';

    const response = await ofetch(url);

    const data = response.data;

    let items: Array<DataItem & { link: string; url?: string }> = data.map((item) => ({
        title: item.title.en,
        link: `${rootUrl}${item.url}`,
        url: item.url,
        pubDate: item.publishedOn ? parseDate(item.publishedOn) : undefined,
    }));
    const baseUrl = 'https://www.dataguidance.com/api/v1/kb/content/articles/by_path?path=';
    items = await pMap(
        items.slice(0, getRouteLimit(ctx)),
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailUrl = `${baseUrl}${item.url}`;

                const detailResponse = await ofetch(detailUrl);

                item.description = detailResponse.contentBody?.html.en.replaceAll('\n', '<br>');
                item.category = detailResponse.topics?.map((topic) => topic.name?.en).filter(Boolean);
                delete item.url;
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: 'Data Guidance News',
        link: 'https://www.dataguidance.com/info?article_type=news_post',
        item: items,
    };
}
