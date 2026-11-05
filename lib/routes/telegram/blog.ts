import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/telegram/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['telegram.org/blog'],
        },
    ],
    name: 'Blog',
    maintainers: ['fengkx'],
    handler,
    url: 'telegram.org/blog',
};
async function handler() {
    const link = 'https://telegram.org/blog';
    const res = await ofetch(link);
    const $$ = load(res);
    const items = await pMap(
        $$('.dev_blog_card_link_wrap').toArray(),
        (each) => {
            const $ = $$(each);
            const link = new URL($.attr('href')!, 'https://telegram.org').href;
            const title = $.find('.dev_blog_card_title').text();
            return mapResolvedValue(
                cache.tryGet(`telegram:blog-content:v2:${link}`, async () => {
                    const result = await ofetch(link);
                    const $ = load(result);
                    const publishedAt = $('[property="article:published_time"]').attr('content');
                    const content = $('#dev_page_content');
                    const footer = content.children('p').last();
                    const signature = footer.children('em');
                    let author: string | undefined;
                    if (footer.children().length === 1 && signature.length === 1 && signature.children('br').length === 1) {
                        const sourceDate = signature.contents().first().text();
                        const sourceAuthor = signature.contents().last().text();
                        if (/^[A-Z][a-z]+ \d{1,2},? \d{4},?$/.test(sourceDate) && sourceAuthor) {
                            author = sourceAuthor;
                            footer.remove();
                        }
                    }
                    return {
                        pubDate: publishedAt ? parseDate(publishedAt) : undefined,
                        description: content.html(),
                        author,
                    };
                }),
                (detail) => ({ title, link, ...detail })
            );
        },
        { concurrency: 3 }
    );
    return {
        title: $$('title').text(),
        link,
        item: items,
    };
}
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
