import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/channel/:id?',
    categories: ['new-media'],
    example: '/storm/channel/2',
    parameters: { id: 'ID，可在 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['storm.mg/channel/:id'],
        },
    ],
    name: '频道',
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '2';

    const rootUrl = 'https://www.storm.mg';
    const currentUrl = new URL('/api/getArticleList', rootUrl).href;
    const limit = getRouteLimit(ctx, 20);

    const response = await ofetch(currentUrl, {
        query: {
            q: {
                condition: ['channel_id'],
                limit: [0, limit],
                order: { col: 'publish_at', sort: 'DESC' },
                pagination: 1,
                remark: '文章列表',
                value: [[id]],
            },
        },
    });

    const list: Array<DataItem & { link: string }> = response.list.map((item) => ({
        title: item.title,
        pubDate: item.publishAt ? parseDate(`${item.publishAt} +0800`, 'YYYY-MM-DD HH:mm:ss ZZ') : undefined,
        author: item.articleAuthor.map((entry) => ({ name: entry.author.name })),
        category: [...item.articleChannel.map((e) => e.channel.title), ...item.articleKeyword.map((e) => e.keyword.title)],
        updated: item.updatedAt ? parseDate(item.updatedAt) : undefined,
        link: new URL(`/article/${item.oldId}`, rootUrl).href,
    }));

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`storm:channel:v5:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link);

                const content = load(detailResponse);

                content('.notify_wordings').remove();
                content('#premium_block').remove();

                const description = (content('[data-test-comp="ArticleCover"]').first().html() ?? '') + (content('div[data-test-comp="ArticleContent"]').html() ?? '');
                const published = content('meta[property="article:published_time"]').attr('content');
                return { description, pubDate: published ? parseDate(published) : undefined };
            });
            return { ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: '風傳媒',
        link: new URL(`/channel/${id}`, rootUrl).href,
        item: items,
    };
}
