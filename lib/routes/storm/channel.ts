import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
    const currentUrl = new URL(`/api/getArticleList`, rootUrl).href;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

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

    const list = response.list.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.createdAt),
        author: item.articleAuthor,
        category: [...item.articleChannel.map((e) => e.channel.title), ...item.articleKeyword.map((e) => e.keyword.title)],
        updated: parseDate(item.updated),
        link: new URL(`/article/${item.oldId}`, rootUrl).href,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const content = load(detailResponse);

                content('.notify_wordings').remove();
                content('#premium_block').remove();

                item.description = content('div[data-test-comp="ArticleContent"]').html();
                return item;
            })
        )
    );

    return {
        title: '風傳媒',
        link: currentUrl,
        item: items,
    };
}
