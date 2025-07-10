import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://www.uber.com';
const apiURL = 'https://blogapi.uber.com';

export const route: Route = {
    path: '/blog/:maxPage?',
    categories: ['blog'],
    example: '/uber/blog',
    parameters: { maxPage: 'max number of pages to retrieve, default to 1 page at most' },
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
            source: ['www.uber.com/:language/blog/engineering', 'www.uber.com/:language/blog'],
            target: '/blog',
        },
    ],
    name: 'Engineering',
    maintainers: ['hulb'],
    handler,
    url: 'www.uber.com/blog/pittsburgh/engineering',
};

async function handler(ctx) {
    let maxPage = Number(ctx.req.param('maxPage'));
    if (Number.isNaN(maxPage)) {
        maxPage = 1;
    }

    let pages = await Promise.all(
        [...Array.from({ length: maxPage }).keys()].map((pageIdx) =>
            got(`${apiURL}/wp-json/blog/v1/data`, {
                searchParams: {
                    page: pageIdx + 1,
                    parent: 'pittsburgh',
                    slug: 'engineering',
                },
            })
        )
    );
    pages = pages.map((page) => page.data);

    const result = await Promise.all(
        pages.map((page) =>
            Promise.all(
                page.posts.map((post) =>
                    cache.tryGet(`${rootURL}${post.link}`, async () => {
                        let { data: article } = await got(`${apiURL}/wp-json/blog/v1/data`, {
                            searchParams: {
                                slug: post.link.replaceAll('/', '').replace('blog', ''),
                            },
                        });
                        article = article.article;

                        return {
                            link: article.link,
                            title: article.title,
                            description: article.content,
                            pubDate: parseDate(article.created),
                            author: article.author,
                            category: article.categories.map((category) => category.category_name),
                        };
                    })
                )
            )
        )
    );

    return {
        title: `Uber Engineering Blog`,
        link: rootURL + '/blog/engineering',
        description: 'The technology behind Uber Engineering',
        item: result.flat(),
    };
}
