import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/author/:author',
    categories: ['traditional-media'],
    example: '/yahoo/author/hannah-keyser',
    parameters: { author: 'Author' },
    name: 'News By Author',
    maintainers: ['loganrockmore'],
    description: 'Provides all of the articles by the specified Yahoo! author.',
    handler,
};
async function fetchArticle(link: string) {
    const detailResponse = await ofetch(link);
    const content = load(detailResponse);
    const metadata = JSON.parse(content('script[type="application/ld+json"]:contains("NewsArticle")').text());
    content('button').remove();
    const cover = content('div.story-cover');
    cover.find('img').removeAttr('style');
    const body = content('div.content-body');
    body.find('div.sda-placeholder-txt, div.bodyad-wrapper, div.content-videowrapper, .consent').remove();
    content('div.story-cover img, div.content-body img').each((_, img) => {
        const src = content(img).attr('src');
        if (!src?.startsWith('https://s.yimg.com/lo/mysterio/')) {
            return;
        }
        content(img).attr('src', decodeURIComponent(src.split('/').at(-1)!));
        content(img).siblings('source').remove();
    });
    return {
        title: content('meta[property="og:title"]').attr('content')!,
        author: metadata.author.name,
        image: metadata.image.url,
        category: metadata.keywords,
        description: (cover.html() ?? '') + body.html(),
        pubDate: parseDate(metadata.datePublished),
        updated: parseDate(metadata.dateModified),
    };
}
async function handler(ctx: Context) {
    const { author } = ctx.req.param();
    const response = await ofetch.raw<string>(`https://www.yahoo.com/author/${author}/`);
    const url = response.url;
    const $ = load(response._data!);
    const title = $('meta[property="og:title"]').attr('content') ?? '';
    const description = $('meta[property="og:description"]').attr('content');
    const list: Array<{ link: string }> = JSON.parse($('script[type="application/ld+json"]:contains("itemListElement")').text())
        .hasPart.mainEntity.itemListElement.slice(0, 10)
        .map((item) => ({
            link: item.url,
        }));
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`yahoo:author:article:v3:${item.link}`, () => fetchArticle(item.link));
            return { ...detail, link: item.link };
        },
        { concurrency: 3 }
    );
    return {
        title,
        link: url,
        description,
        language: 'en-us' as const,
        item: items,
    };
}
