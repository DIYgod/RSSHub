import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

const baseUrl = 'https://deadbydaylight.com';

type ArticleDate = {
    published_at: string;
    publication_date?: string | null;
};

const getPublicationDate = (article: ArticleDate) => parseDate(article.publication_date || article.published_at);

export const route: Route = {
    path: '/blog',
    categories: ['game'],
    example: '/deadbydaylight/blog',
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
            source: ['deadbydaylight.com/news'],
            target: '/blog',
        },
    ],
    name: 'Latest News',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler() {
    const data = await ofetch<{ result: { pageContext: { postsData: { articles: { edges: Array<{ node: ArticleDate & { slug: string } }> } } } } }>(`${baseUrl}/page-data/news/page-data.json`);

    const articleMeta = data.result.pageContext.postsData.articles.edges;
    // { 0: node: { id, locale, slug, title, excerpt, image, published_at, article_category}}
    const orderedArticles = articleMeta;
    const candidates = orderedArticles;

    const items = await pMap(
        candidates,
        (edge) => {
            const content = edge.node;
            const slug = content.slug;
            const dataUrl = `${baseUrl}/page-data/news/${slug}/page-data.json`;

            return cache.tryGet(dataUrl, async () => {
                const articleData = await ofetch(dataUrl);
                const pageData = articleData.result.data.pageData;

                return {
                    title: pageData.title,
                    link: `${baseUrl}${articleData.path}`,
                    description: md.render(pageData.content),
                    pubDate: getPublicationDate(pageData),
                    category: pageData.article_category.name,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: 'Latest News',
        link: 'https://deadbydaylight.com/news',
        item: items,
    };
}
