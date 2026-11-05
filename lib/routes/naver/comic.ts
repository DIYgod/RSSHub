import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

type ComicArticle = {
    no: number;
    subtitle: string;
    charge: boolean;
    thumbnailUrl: string;
    serviceDateDescription?: string;
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const comicLink = `${domain}/webtoon/list?titleId=${id}`;

    const info = await cache.tryGet(`naver:comic:info:${id}`, () => ofetch(`${domain}/api/article/list/info?titleId=${id}`));
    const list = await ofetch<{ articleList: ComicArticle[] }>(`${domain}/api/article/list?titleId=${id}&page=1&sort=DESC`);

    const item = await pMap(
        list.articleList,
        async (article) => {
            const link = `${domain}/webtoon/detail?titleId=${id}&no=${article.no}`;
            const detail = article.charge
                ? { description: `<img src="${article.thumbnailUrl}">` }
                : await cache.tryGet(`naver:comic:article:v2:${link}`, async () => {
                      const body = await ofetch(link);
                      const $ = load(body);
                      return { description: $('#comic_view_area > div.wt_viewer').html() };
                  });
            return {
                title: article.subtitle,
                pubDate: article.serviceDateDescription ? timezone(parseDate(article.serviceDateDescription, 'YY.MM.DD'), 9) : undefined,
                link,
                ...detail,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: info.titleName,
        link: comicLink,
        description: info.synopsis,
        image: info.thumbnailUrl,
        item,
    };
}
