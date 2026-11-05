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
            source: ['www.cockroachlabs.com/blog/:category'],
            target: '/blog/:category',
        },
        {
            source: ['www.cockroachlabs.com/blog'],
            target: '/blog',
        },
        {
            source: ['cockroachlabs.com/blog/:category'],
            target: '/blog/:category',
        },
        {
            source: ['cockroachlabs.com/blog'],
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

    const articleList = html('a[href^="/blog/"]')
        .filter((_, element) => html(element).children('h2, p').length > 0)
        .map((_, element) => ({
            title: html(element).children('h2, p').first().text(),
            link: new URL(html(element).attr('href')!, rootUrl).href,
        }));

    const items = await Promise.all(
        articleList.toArray().map((article) =>
            cache.tryGet(article.link, async () => {
                const response = await ofetch(article.link);
                const $ = load(response);

                // <article class="blog-content null">
                //   ..multiple <div>/<a>/<img>/<p>..
                // </article>
                const content = $('article.blog-content').html();

                const metadata = $('script[type="application/ld+json"]')
                    .toArray()
                    .map((element) => JSON.parse($(element).text()) as { '@type'?: string; datePublished?: string; dateModified?: string })
                    .find((item) => item['@type'] === 'TechArticle');

                return {
                    title: article.title,
                    link: article.link,
                    description: content,
                    pubDate: metadata?.datePublished ? parseDate(metadata.datePublished) : undefined,
                    updated: metadata?.dateModified ? parseDate(metadata.dateModified) : undefined,
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
