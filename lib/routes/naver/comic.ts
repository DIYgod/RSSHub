import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/comic/:id',
    categories: ['anime'],
    example: '/naver/comic/651673',
    parameters: { id: 'titleId of naver webtoon' },
    name: 'Comic',
    maintainers: ['zfanta'],
    handler,
};

const domain = 'https://comic.naver.com';

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const comicLink = `${domain}/webtoon/list?titleId=${id}`;

    const info = await cache.tryGet(`naver:comic:info:${id}`, () => ofetch(`${domain}/api/article/list/info?titleId=${id}`));
    const list = await ofetch(`${domain}/api/article/list?titleId=${id}&page=1&sort=DESC`);

    const item = await Promise.all(
        list.articleList.map((article) => {
            const link = `${domain}/webtoon/detail?titleId=${id}&no=${article.no}`;
            return cache.tryGet(link, async () => {
                if (article.charge) {
                    return {
                        title: article.subtitle,
                        pubDate: parseDate(article.serviceDateDescription, 'YY.MM.DD'),
                        link,
                        description: `<img src="${article.thumbnailUrl}">`,
                    };
                }

                const body = await ofetch(link);
                const $ = load(body);

                return {
                    title: article.subtitle,
                    pubDate: parseDate(article.serviceDateDescription, 'YY.MM.DD'),
                    link,
                    description: $('#comic_view_area > div.wt_viewer').html(),
                };
            });
        })
    );

    return {
        title: info.titleName,
        link: comicLink,
        description: info.synopsis,
        image: info.thumbnailUrl,
        item,
    };
}
