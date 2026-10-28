import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/newlist',
    categories: ['study'],
    example: '/ncpssd/newlist',
    radar: [
        {
            source: ['ncpssd.cn/', 'ncpssd.cn/newlist'],
        },
    ],
    name: '最新文献',
    maintainers: ['LyleLee'],
    handler,
    url: 'ncpssd.cn/',
};

interface ArticleResponse {
    data?: {
        showwriter?: string | null;
        remarkc?: string | null;
        publishDateTime?: string | null;
    };
}

async function handler() {
    const baseUrl = 'https://www.ncpssd.cn';
    const link = `${baseUrl}/newlist?type=0`;
    const listingContent = await ofetch(link);
    const $ = load(listingContent);
    const list = $('.news-list > li')
        .toArray()
        .flatMap((element) => {
            const $article = $(element).find('a');
            const href = $article.attr('onclick')?.match(/\('(.*?)'\)/)?.[1];
            if (!href) {
                return [];
            }
            return { title: $article.text(), link: new URL(href, baseUrl).href };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const articleContent = await ofetch(item.link);
                const $detail = load(articleContent);
                const lngid = $detail('#ftl_urlId').attr('value');
                const type = $detail('#ftl_urlTypename').attr('value');
                if (!lngid || !type) {
                    throw new Error('The NCpssd article page did not provide the identifiers required by its detail API.');
                }
                const response = await ofetch<ArticleResponse>(`${baseUrl}/articleinfoHandler/getjournalarticletable`, {
                    method: 'POST',
                    body: { lngid, type, pageType: $detail('#ftl_urlPagetype').attr('value') ? 2 : 1 },
                });
                if (!response.data) {
                    throw new Error('The NCpssd detail API did not return article data. The source may require access verification.');
                }
                return {
                    ...item,
                    author: response.data.showwriter ?? undefined,
                    description: response.data.remarkc ?? undefined,
                    pubDate: response.data.publishDateTime ? parseDateInTimezone(response.data.publishDateTime, 8) : undefined,
                };
            }),
        { concurrency: 6 }
    );

    return {
        title: '国家哲学社会科学文献中心',
        link,
        item: items,
    };
}
