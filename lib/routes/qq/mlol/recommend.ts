import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/mlol/recommend',
    categories: ['game'],
    example: '/qq/mlol/recommend',
    name: '掌上英雄联盟推荐',
    maintainers: ['alizeegod'],
    handler,
};

async function handler() {
    const response = await ofetch('https://mlol.qt.qq.com/go/mlol_news/recommend_feeds');

    const items = await Promise.all(
        response.data.feedsInfo.map((feed) => {
            const body = feed.feedNews.body;
            const link = `https://mlol.qt.qq.com/go/mlol_news/varcache_article?docid=${body.commentID}&gameid=${feed.feedNews.footer.zoneGameId}`;
            const item = {
                title: body.title,
                description: `<img src="${body.imgUrl.split('?', 1)[0]}">`,
                pubDate: timezone(parseDate(body.comCreateDate), 8),
                link,
                author: body.nickName,
                guid: body.commentID,
            };
            if (!feed.feedBase.intent.startsWith('https://')) {
                return item;
            }

            return cache.tryGet(link, async () => {
                const detail = await ofetch(link);
                const $ = load(detail);
                item.description = $('.article_content').html() ?? item.description;
                return item;
            });
        })
    );

    return {
        title: '掌上英雄联盟 - 推荐',
        link: 'https://lol.qq.com/app/index.html',
        item: items,
    };
}
