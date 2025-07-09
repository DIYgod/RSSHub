import { Data, Route, ViewType } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { rootUrl, extractArticleLinks, fetchArticleContent } from './utils';

export const route: Route = {
    path: '/trending',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/scroll/trending',
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
            source: ['scroll.in/trending'],
            target: '/trending',
        },
    ],
    name: 'Trending',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const currentUrl = `${rootUrl}/trending`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const articleLinks = extractArticleLinks($);
    const items = await Promise.all(articleLinks.map((item) => fetchArticleContent(item)));

    return {
        title: 'Scroll.in - Trending',
        description: 'Trending articles from Scroll.in',
        link: currentUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
