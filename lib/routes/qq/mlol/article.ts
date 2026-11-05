import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface FeedInfo {
    feedNews: {
        body: { title: string; imgUrl: string; comCreateDate: string; commentID: string; nickName: string };
        footer: { source: string; zoneGameId: string };
    };
    feedBase: { intent: string };
}

export const route: Route = {
    path: '/mlol/article/:uuid',
    categories: ['game'],
    example: '/qq/mlol/article/ee97e19c-4a64-4637-b916-b9ee23744d1f',
    parameters: { uuid: '用户 UUID，可在文章 html 中获取' },
    name: '掌上英雄联盟用户文章',
    maintainers: ['ztmzzz'],
    handler,
};

async function handler(ctx: Context) {
    const { uuid } = ctx.req.param();
    const url = `https://mlol.qt.qq.com/go/mlol_news/author_feeds?author_uuid=${uuid}`;

    const response = await ofetch<{ data: { feedsInfo: FeedInfo[] } }>(url);
    const data = response.data.feedsInfo;
    const name = data[0].feedNews.footer.source;

    const items = await pMap(
        data,
        (feed) => {
            const body = feed.feedNews.body;
            const link = `https://mlol.qt.qq.com/go/mlol_news/varcache_article?is_lqt=true&docid=${body.commentID}`;
            const item = {
                title: body.title,
                description: `<img src='${body.imgUrl.split('?', 1)[0]}'>`,
                pubDate: timezone(parseDate(body.comCreateDate), 8),
                link,
            };

            return cache.tryGet(link, async () => {
                const detail = await ofetch(link);
                const $ = load(detail);
                item.description = $('.article_content').html() ?? item.description;
                return item;
            });
        },
        { concurrency: 3 }
    );

    return {
        title: `${name}的文章`,
        link: 'https://lol.qq.com/app/index.html',
        description: `${name}的文章`,
        item: items,
    };
}
