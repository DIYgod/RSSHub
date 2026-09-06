import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    const response = await ofetch(url);
    const data = response.data.feedsInfo;
    const name = data[0].feedNews.footer.source;

    const items = await Promise.all(
        data.map((feed) => {
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
        })
    );

    return {
        title: `${name}的文章`,
        link: url,
        description: `${name}的文章`,
        item: items,
    };
}
