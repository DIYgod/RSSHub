import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

export const route: Route = {
    name: 'Blogs',
    maintainers: ['CookiePieWw'],
    categories: ['programming'],
    path: '/blog/:category',
    example: '/cockroachlabs/blog/engineering',
    parameters: { category: 'Blog category, e.g., engineering' },
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
            target: '/cockroachlabs/blog/:category',
        },
    ],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const rootUrl = 'https://www.cockroachlabs.com';
    const currentUrl = `${rootUrl}/blog/${category}`;

    const webpage = await ofetch(currentUrl);
    const html = load(webpage);

    // Title article:
    // <a href="href..">
    //   <h2 class="mb-3 truncate text-display-md font-semibold tracking-tight md:max-w-full md:text-white">
    //     Title...
    //   </h2>
    // </a>
    const titleH2Element = html('[class="mb-3 truncate text-display-md font-semibold tracking-tight md:max-w-full md:text-white"]');
    const titleArticle = titleH2Element.text();
    const parentAElement = titleH2Element.parent('a');
    const articleLink = parentAElement.attr('href');

    // Left articles:
    // <a href="href..">
    //   <p class="mb-2 line-clamp-2 text-lg font-semibold leading-5">
    //    Title..
    //   </p>
    // </a>
    const leftArticles = html('a > p[class="mb-2 line-clamp-2 text-lg font-semibold leading-5"]');
    const articleList = leftArticles.map((_, element) => {
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

                return {
                    title: article.title,
                    link: article.link,
                    description: content,
                };
            })
        )
    );

    return {
        title: titleArticle,
        link: articleLink,
        item: items,
        description: 'Cockroach Labs Blog',
    };
}
