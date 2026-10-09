import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

dayjs.extend(utc);
dayjs.extend(timezone);

export const route: Route = {
    path: '/search/:keyword',
    categories: ['new-media'],
    example: '/freshplaza/search/durian',
    parameters: { keyword: 'Search keyword' },
    name: 'Search',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.freshplaza.com/asia/',
};

async function handler(ctx: Context) {
    const { keyword } = ctx.req.param();
    const baseUrl = 'https://www.freshplaza.com';
    const link = `${baseUrl}/asia/archive/search/?query=${encodeURIComponent(keyword)}&page=1`;

    const { results } = await ofetch(link);

    const list = results.map((item): DataItem => ({
        title: item.title,
        link: `${baseUrl}/asia/article/${item.id}/${item.titleSlug}/`,
        image: item.image?.src,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                item.description = $('main[itemprop="articleBody"]').html()?.trim();
                item.pubDate = dayjs.tz($('time[itemprop="datePublished"]').attr('datetime')!, 'Europe/Amsterdam').toDate();
                return item;
            })
        )
    );

    return {
        title: `FreshPlaza - ${keyword}`,
        link,
        image: `${baseUrl}/dist/img/fp-com/favicon.png`,
        item: items,
    };
}
