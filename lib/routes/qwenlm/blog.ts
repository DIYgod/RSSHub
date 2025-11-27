import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['blog'],
    example: '/qwenlm/blog/zh',
    parameters: { lang: 'Blog language' },
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
            source: ['qwenlm.github.io/blog/', 'qwenlm.github.io/:lang/blog/'],
            target: '/qwenlm/blog/:lang',
        },
    ],
    name: 'Blog',
    maintainers: ['Kjasn'],
    handler: async (ctx) => {
        const { lang } = ctx.req.param();

        const blogUrl = lang ? `https://qwenlm.github.io/${lang}/blog` : 'https://qwenlm.github.io/blog';

        const response = await ofetch(blogUrl);
        const $ = load(response);

        // get blog list
        const list = $('article.post-entry')
            .toArray()
            .map((item) => {
                item = $(item);

                const dateString = item
                    .find('.entry-footer span')
                    .attr('title')
                    .trim()
                    .replace(/\+0800$/, '');
                // const pubDate = timezone(parseDate(dateString, 'YYYY-MM-DD HH:mm:ss ZZ'), +8);
                const pubDate = parseDate(dateString);

                return {
                    title: item.find('header.entry-header h2').text().trim(),
                    link: item.find('.entry-link').attr('href'),
                    pubDate,
                };
            });

        // get blog content
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.description = $('main').html();
                    return item;
                })
            )
        );

        return {
            title: 'Qwen Blog',
            link: blogUrl,
            item: items,
        };
    },
};
