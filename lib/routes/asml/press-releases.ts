import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/press-releases',
    categories: ['new-media'],
    example: '/asml/press-releases',
    parameters: {},
    name: 'Press releases & announcements',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://investor.asml.com';
    const currentUrl = `${rootUrl}/news/press-releases-and-announcements`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const list = $('.search-results__item')
        .toArray()
        .map((article) => {
            const $article = $(article);
            const link = $article.find('.search-results__title a');
            return {
                title: link.text(),
                link: new URL(link.attr('href')!, rootUrl).href,
                pubDate: parseDate($article.find('.search-results__date-posted').text(), 'MMMM D, YYYY'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $$ = load(detailResponse);
                const content = $$('.full-release-body');
                const heading = content.children('p').first();
                if (heading.text().trim() === item.title.trim()) {
                    heading.remove();
                }

                return {
                    ...item,
                    description: content.html(),
                };
            })
        )
    );

    return {
        title: 'Press releases | ASML',
        link: currentUrl,
        item: items,
    };
}
