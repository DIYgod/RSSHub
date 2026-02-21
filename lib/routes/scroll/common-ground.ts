import { Data, Route, ViewType } from '@/types';
import { rootUrl, extractFeedArticleLinks, fetchArticleContent } from './utils';

export const route: Route = {
    path: '/commonGround',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/scroll/commonGround',
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
            source: ['scroll.in/topic/56439/common-ground'],
            target: '/commonGround',
        },
    ],
    name: 'Common Ground',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const currentUrl = `${rootUrl}/topic/56439/common-ground`;
    const articleLinks = await extractFeedArticleLinks('topic/56439');

    const items = await Promise.all(articleLinks.map((item) => fetchArticleContent(item)));

    return {
        title: 'Scroll.in - Common Ground',
        description: 'Common Ground articles from Scroll.in',
        link: currentUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
