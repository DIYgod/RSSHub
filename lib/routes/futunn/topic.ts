import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

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
    const response = await got(link);
    const $ = load(response.data);
    return {
        topicTitle: $('meta[property="og:title"]').attr('content') ?? $('title').text(),
        topicDescription: $('meta[property="og:description"]').attr('content') ?? $('meta[name="description"]').attr('content'),
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

    let items = response.data.data.data.map((item) => ({
        title: item.title,
        link: item.url,
        author: item.source,
        pubDate: parseDate(item.time * 1000),
        description: renderDescription({
            abs: item.abstract,
            pic: item.pic,
        }),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/news\.futunn\.com/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    content('.futu-news-time-stamp').remove();
                    content('.nnstock').each((_, el) => {
                        content(el).replaceWith(`<a href="${content(el).attr('href')}">${content(el).text().replaceAll('$', '')}</a>`);
                    });

                    item.description = content('.origin_content').html();
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
