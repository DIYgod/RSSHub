import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Blogs',
    maintainers: ['CookiePieWw'],
    categories: ['programming'],
    path: '/blog/:category?',
    example: '/cockroachlabs/blog/engineering',
    parameters: { category: 'Blog category, e.g., engineering. Subscribe all recent articles if empty.' },
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
            source: ['cockroachlabs.com/blog/:category', 'cockroachlabs.com/blog'],
            target: '/blog',
        },
    ],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const rootUrl = 'https://www.cockroachlabs.com';
    const currentUrl = `${rootUrl}/blog${category ? `/${category}/` : '/'}`;

    const webpage = await ofetch(currentUrl);
    const html = load(webpage);

    // Title article:
    // <a href="href..">
    //   <h2 class="mb-3 truncate text-display-md font-semibold tracking-tight md:max-w-full md:text-white">
    //     Title...
    //   </h2>
    // </a>
    const titleH2Element = html('[class="mb-3 truncate text-display-md font-semibold tracking-tight md:max-w-full md:text-white"]');

    // Left articles:
    // <a href="href..">
    //   <p class="mb-2 line-clamp-2 text-lg font-semibold leading-5">
    //    Title..
    //   </p>
    // </a>
    const leftArticles = html('a > p[class="mb-2 line-clamp-2 text-lg font-semibold leading-5"]');
    const articleList = titleH2Element.add(leftArticles).map((_, element) => {
        const title = html(element).text();
        const link = `${rootUrl}${html(element).parent('a').attr('href')}`;
        return { title, link };
    });

    const items = await Promise.all(
        articleList.toArray().map((article) =>
            cache.tryGet(article.link, async () => {
                const response = await ofetch(article.link);
                const $ = load(response);

                // <article class="blog-content null">
                //   ..multiple <div>/<a>/<img>/<p>..
                // </article>
                const content = $('article.blog-content').html() || '';

                // <div class="mt-4 flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-4">
                //   <div>
                //     <p>
                //       Last edited on June 13, 2025
                //     </p>
                //   </div>
                //   ...
                // </div>
                const dateText = $(String.raw`div.mt-4.flex.flex-col.items-center.justify-center.gap-1.sm\:flex-row.sm\:gap-4`)
                    .find('p')
                    .first()
                    .text()
                    .match(/Last edited on (.+)/)?.[1];

                let pubDate: Date | undefined;
                if (dateText) {
                    try {
                        const date = new Date(dateText);
                        if (!Number.isNaN(date.getTime())) {
                            pubDate = parseDate(date.toISOString().split('T')[0]);
                        }
                    } catch {
                        // Ignore parsing errors
                    }
                }

                return {
                    title: article.title,
                    link: article.link,
                    description: content,
                    pubDate,
                };
            })
        )
    );

    return {
        title: `Cockroach Labs Blog${category ? ` - ${category}` : ''}`,
        link: currentUrl,
        item: items,
        description: 'Cockroach Labs Blog',
    };
}
