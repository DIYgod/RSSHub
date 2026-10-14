import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/press-releases/:category?/:title?',
    categories: ['government'],
    example: '/treasury/press-releases',
    parameters: { category: 'Category, see below, all by default', title: 'Title keywords, empty by default' },
    name: 'Press Releases',
    maintainers: ['nczitzk'],
    handler,
    description: `Category

| Press Releases | Statements & Remarks | Readouts | Testimonies |
| -------------- | -------------------- | -------- | ----------- |
| all            | statements-remarks   | readouts | testimonies |`,
};

type ArticleDetails = Pick<DataItem, 'description' | 'pubDate'>;

async function fetchArticleDetails(link: string): Promise<ArticleDetails> {
    const detailResponse = await ofetch(link);
    const content = load(detailResponse);
    const publishedTime = content('time').attr('datetime');
    return {
        description: content('.field--name-field-news-body').html(),
        pubDate: publishedTime ? parseDate(publishedTime) : undefined,
    };
}

async function handler(ctx: Context) {
    const { category = 'all', title = '' } = ctx.req.param();

    const rootUrl = 'https://home.treasury.gov';
    const currentUrl = new URL(`/news/press-releases${category === 'all' ? '' : `/${category}`}`, rootUrl);
    if (title) {
        currentUrl.searchParams.set('title', title);
    }
    const response = await ofetch(currentUrl.href);

    const $ = load(response);

    const list = $('.featured-stories__headline a')
        .slice(0, 10)
        .toArray()
        .filter((item) => $(item).attr('href'))
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, currentUrl).href,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(item.link!, () => fetchArticleDetails(item.link!));
            return { ...item, description: details.description, pubDate: details.pubDate };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('head title').text(),
        link: currentUrl.href,
        item: items,
    };
}
