import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});

const baseUrl = 'https://deadbydaylight.com';

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
            target: '/news',
        },
    ],
    name: 'Latest News',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler() {
    const data = await ofetch(`${baseUrl}/page-data/news/page-data.json`);

    const articleMeta = data.result.pageContext.postsData.articles.edges;
    // { 0: node: { id, locale, slug, title, excerpt, image, published_at, article_category}}

    const items = await Promise.all(
        Object.keys(articleMeta).map((id) => {
            const content = articleMeta[id].node;
            const slug = content.slug;
            const dataUrl = `${baseUrl}/page-data/news/${slug}/page-data.json`;

            return cache.tryGet(dataUrl, async () => {
                const articleData = await ofetch(dataUrl);
                const pageData = articleData.result.data.pageData;

                return {
                    title: pageData.title,
                    link: `${baseUrl}${articleData.path}`,
                    description: md.render(pageData.content),
                    pubDate: parseDate(pageData.published_at),
                    category: pageData.article_category.name,
                };
            });
        })
    );

    return {
        title: 'Latest News',
        link: 'https://deadbydaylight.com/news',
        item: items,
    };
}
