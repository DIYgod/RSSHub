import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

import { renderDescription } from './templates/description';
import { getArticle } from './utils';

export const route: Route = {
    path: '/topic/:id',
    categories: ['finance'],
    example: '/futunn/topic/1267',
    parameters: { id: 'Topic ID, can be found in URL' },
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['news.futunn.com/news-topics/:id/*', 'news.futunn.com/:lang/news-topics/:id/*'],
            target: '/topic/:id',
        },
    ],
    name: '专题',
    maintainers: ['kennyfong19931'],
    handler,
};

async function getTopic(link: string) {
    const $ = await getArticle(link);
    return {
        topicTitle: $('meta[property="og:title"]').attr('content'),
        topicDescription: $('meta[property="og:description"]').attr('content'),
    };
}

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 48);
    const id = ctx.req.param('id');

    const rootUrl = 'https://news.futunn.com';
    const link = `${rootUrl}/news-topics/${id}/`;
    const apiUrl = `${rootUrl}/news-site-api/topic/get-topics-news-list?topicsId=${id}&pageSize=${limit}`;

    const { topicTitle, topicDescription } = await cache.tryGet(link, () => getTopic(link));

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.data.map((item) => ({
        title: item.title,
        link: item.url,
        author: item.source,
        pubDate: parseDate(item.time * 1000),
        description: renderDescription({
            abs: item.abstract,
            pic: item.pic,
        }),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // only follow links on the site itself
                if (isOnSite(item.link, 'news.futunn.com')) {
                    const content = await getArticle(item.link);

                    content('.futu-news-time-stamp').remove();
                    content('.nnstock').each((_, el) => {
                        content(el).replaceWith(`<a href="${content(el).attr('href')}">${content(el).text().replaceAll('$', '')}</a>`);
                    });

                    item.description = content('.origin_content').html() || item.description;
                    item.category = [
                        ...content('.news__from-topic__title')
                            .toArray()
                            .map((a) => content(a).text().trim()),
                        ...content('#relatedStockWeb .stock-name')
                            .toArray()
                            .map((s) => content(s).text().trim()),
                    ];
                }

                return item;
            })
        )
    );

    return {
        title: `富途牛牛 - 专题 - ${topicTitle}`,
        link,
        description: topicDescription,
        item: items,
    };
}
