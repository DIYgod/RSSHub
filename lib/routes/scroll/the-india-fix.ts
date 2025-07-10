import { Data, Route, ViewType } from '@/types';
import { rootUrl, extractFeedArticleLinks, fetchArticleContent } from './utils';

export const route: Route = {
    path: '/theIndiaFix',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/scroll/theIndiaFix',
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
            source: ['scroll.in/topic/56455/the-india-fix'],
            target: '/theIndiaFix',
        },
    ],
    name: 'The India Fix',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const currentUrl = `${rootUrl}/topic/56455/the-india-fix`;
    const articleLinks = await extractFeedArticleLinks('topic/56455');
    const items = await Promise.all(articleLinks.map((item) => fetchArticleContent(item)));

    return {
        title: 'Scroll.in - The India Fix',
        description: 'The India Fix articles from Scroll.in',
        link: currentUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    } as Data;
}
