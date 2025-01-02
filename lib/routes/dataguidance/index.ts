import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'News',
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

async function handler() {
    const rootUrl = 'https://www.dataguidance.com';
    const url = 'https://dgcb20-ca-northeurope-dglive.yellowground-c1f17366.northeurope.azurecontainerapps.io/api/v1/content/articles?order=DESC_publishedOn&limit=25&article_types=news_post';

    const response = await ofetch(url);

    const data = response.data;

    let items = data.map((item) => ({
        title: item.title.en,
        link: `${rootUrl}${item.url}`,
        url: item.url,
        pubDate: parseDate(item.publishedOn),
    }));
    const baseUrl = 'https://dgcb20-ca-northeurope-dglive.yellowground-c1f17366.northeurope.azurecontainerapps.io/api/v1/content/articles/by_path?path=';
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailUrl = `${baseUrl}${item.url}`;

                const detailResponse = await ofetch(detailUrl);

                item.description = detailResponse.contentBody?.html.en.replaceAll('\n', '<br>');
                delete item.url;
                return item;
            })
        )
    );

    return {
        title: 'Data Guidance News',
        link: 'https://www.dataguidance.com/info?article_type=news_post',
        item: items,
    };
}
