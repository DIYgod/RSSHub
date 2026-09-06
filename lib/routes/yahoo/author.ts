import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

async function handler(ctx: Context) {
    const { author } = ctx.req.param();

    const response = await ofetch.raw<string>(`https://www.yahoo.com/author/${author}/`);
    const url = response.url;

    const $ = load(response._data!);
    const title = $('meta[property="og:title"]').attr('content') ?? '';
    const description = $('meta[property="og:description"]').attr('content');

    const list = $('script[type="application/ld+json"]')
        .toArray()
        .map((item) => JSON.parse($(item).text()))
        .find((data) => data.hasPart?.mainEntity?.itemListElement)
        .hasPart.mainEntity.itemListElement.slice(0, 10)
        .map((item) => ({
            link: item.url,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                content('button').remove();

                const cover = content('div.story-cover');
                cover.find('img').removeAttr('style');

                const body = content('div.content-body');
                body.find('div.sda-placeholder-txt, div.bodyad-wrapper, div.content-videowrapper, .consent').remove();

                content('div.story-cover img, div.content-body img').each((_, img) => {
                    const src = content(img).attr('src');
                    if (src?.startsWith('https://s.yimg.com/lo/mysterio/')) {
                        content(img).attr('src', decodeURIComponent(src.split('/').at(-1)!));
                        content(img).siblings('source').remove();
                    }
                });

                return {
                    ...item,
                    title: content('meta[property="og:title"]').attr('content'),
                    description: (cover.html() ?? '') + body.html(),
                    pubDate: parseDate(content('time').attr('datetime')!),
                };
            })
        )
    );

    return {
        title,
        link: url,
        description,
        item: items,
    };
}
