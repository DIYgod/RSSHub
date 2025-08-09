import { Data, Route, ViewType } from '@/types';
import { rootUrl, extractFeedArticleLinks, fetchArticleContent } from './utils';

export const route: Route = {
    path: '/ecoIndia',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/scroll/ecoIndia',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['scroll.in/topic/56120/eco-india'],
            target: '/ecoIndia',
        },
    ],
    name: 'Eco India',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const currentUrl = `${rootUrl}/topic/56120/eco-india`;
    const articleLinks = await extractFeedArticleLinks('topic/56120');
    const items = await Promise.all(articleLinks.map((item) => fetchArticleContent(item)));

    return {
        title: 'Scroll.in - Eco India',
        description: 'Eco India articles and videos from Scroll.in',
        link: currentUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
