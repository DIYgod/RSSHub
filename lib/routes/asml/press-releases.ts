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

interface AsmlArticle {
    title: { data: { value: string } };
    url: { path: string };
    articleDate: { data: { value: string } };
}

async function handler() {
    const rootUrl = 'https://www.asml.com';
    const currentUrl = `${rootUrl}/en/news/press-releases`;

    const buildId = await cache.tryGet('asml:buildId', async () => {
        const html = await ofetch(currentUrl);
        return html.match(/"buildId":"(.*?)"/)[1];
    });

    const response = await ofetch<{ pageProps: { componentProps: Record<string, { articles: AsmlArticle[] }> } }>(`${rootUrl}/_next/data/${buildId}/en/news/press-releases.json`, {
        query: { path: ['news', 'press-releases'] },
    });

    const list = Object.values(response.pageProps.componentProps)[0]
        .articles.flat()
        .map((article) => ({
            title: article.title.data.value.trim(),
            link: `${rootUrl}${article.url.path}`,
            pubDate: parseDate(article.articleDate.data.value),
            path: article.url.path,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(`${rootUrl}/_next/data/${buildId}${item.path}.json`);
                const { fields, placeholders } = detailResponse.pageProps.page.layout.sitecore.route;

                return {
                    ...item,
                    description: placeholders['headless-main']
                        .find((component) => component.componentName === 'CustomContainer')
                        .placeholders['content-component-placeholder'].map((component) => component.fields.content.value)
                        .join(''),
                    pubDate: parseDate(fields.publicationDate.value),
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
