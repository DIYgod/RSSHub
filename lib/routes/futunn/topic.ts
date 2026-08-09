import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

import { renderDescription } from './templates/description';
import { extractArticleInfo, fetchArticleDetail } from './utils';

export const route: Route = {
    path: '/topic/:id',
    categories: ['finance'],
    example: '/futunn/topic/1267',
    parameters: { id: 'Topic ID, can be found in URL' },
    features: {
        supportRadar: true,
        requirePuppeteer: true,
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

async function getTopic(rootUrl, id, seqMarkInput = '') {
    const topicListResponse = await got({
        method: 'get',
        url: `${rootUrl}/news-site-api/main/get-topics-list?pageSize=48&seqMark=${seqMarkInput}`,
    });
    const { hasMore, seqMark, list } = topicListResponse.data.data.data;
    const topic = list.find((item) => item.idx === id);
    if (topic) {
        return {
            topicTitle: topic.title,
            topicDescription: topic.detail,
        };
    }
    if (hasMore === 1) {
        return getTopic(rootUrl, id, seqMark);
    }
    return {
        topicTitle: '',
        topicDescription: '',
    };
}

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 48;
    const id = ctx.req.param('id');

    const rootUrl = 'https://news.futunn.com';
    const link = `${rootUrl}/news-topics/${id}/`;
    const apiUrl = `${rootUrl}/news-site-api/topic/get-topics-news-list?topicsId=${id}&pageSize=${limit}`;

    const { topicTitle, topicDescription } = await cache.tryGet(link, async () => await getTopic(rootUrl, id));

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

    const context = await playwright();

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/news\.futunn\.com/.test(item.link)) {
                    const content = await fetchArticleDetail(context, item.link);

                    const { description, category } = extractArticleInfo(content);

                    item.description = description;
                    item.category = category;
                }

                return item;
            })
        )
    );

    await context.close();

    return {
        title: `富途牛牛 - 专题 - ${topicTitle}`,
        link,
        description: topicDescription,
        item: items,
    };
}
