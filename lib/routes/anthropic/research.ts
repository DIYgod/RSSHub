import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/research',
    categories: ['programming'],
    example: '/anthropic/research',
    parameters: {},
    radar: [
        {
            source: ['www.anthropic.com/research', 'www.anthropic.com'],
        },
    ],
    name: 'Research',
    maintainers: ['ttttmr'],
    handler,
    url: 'www.anthropic.com/research',
};

async function handler(ctx) {
    const link = 'https://www.anthropic.com/research';
    const response = await ofetch(link);
    const $ = load(response);
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    const posts: DataItem[] = $('[class^="PublicationList-module-scss-module__"][class$="__list"] a')
        .toArray()
        .map((element) => {
            const $element = $(element);
            const title = $element.find('[class*="__title"]').text().trim();
            const href = $element.attr('href') ?? '';
            const dateText = $element.find('time').text().trim();
            const category = $element.find('[class*="__subject"]').text().trim();
            const postLink = href.startsWith('http') ? href : `https://www.anthropic.com${href}`;
            return {
                title,
                link: postLink,
                pubDate: dateText ? parseDate(dateText, 'MMM D, YYYY') : undefined,
                category: category ? [category] : undefined,
            };
        })
        .filter((post) => post.title && post.link)
        .slice(0, limit);

    const items = await pMap(
        posts,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('#main-content > article');
                content
                    .find('[class$="__header"], [class$="__sidebar-container"], [class$="__controls"], [class$="__socialShare"], [class^="LandingPageSection-module-scss-module__"], [class^="SubjectNewsletter-module-scss-module__"]')
                    .remove();
                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset');
                    const src = $e.attr('src');
                    const params = new URLSearchParams(src);
                    const newSrc = params.get('/_next/image?url');
                    if (newSrc) {
                        $e.attr('src', newSrc);
                    }
                });

                item.description = content.html();

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic Research',
        link,
        description: 'Latest research from Anthropic',
        item: items,
    };
}
