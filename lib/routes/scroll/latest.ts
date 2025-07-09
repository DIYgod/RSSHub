import { Data, Route, ViewType } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { rootUrl, extractArticleLinks, fetchArticleContent } from './utils';

export const route: Route = {
    path: '/latest',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/scroll/latest',
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
            source: ['scroll.in/latest/'],
            target: '/latest',
        },
    ],
    name: 'Latest News',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const currentUrl = `${rootUrl}/latest/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const articleLinks = extractArticleLinks($);
    const items = await Promise.all(articleLinks.map((item) => fetchArticleContent(item)));

    return {
        title: 'Scroll.in - Latest News',
        description: 'Latest news from Scroll.in',
        link: currentUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
