import { Data, Route } from '@/types';
import { getRelativeUrlList, processList, rootUrl } from './utils';

export const route: Route = {
    path: '/latest/:category?',
    categories: ['programming'],
    example: '/joshwcomeau/latest/css',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    parameters: {
        category: {
            description: 'Category',
            options: [
                { value: 'css', label: 'CSS' },
                { value: 'react', label: 'React' },
                { value: 'animation', label: 'Animation' },
                { value: 'javascript', label: 'JavaScript' },
                { value: 'career', label: 'Career' },
                { value: 'blog', label: 'Blog' },
            ],
        },
    },
    radar: [
        {
            source: ['joshwcomeau.com/'],
            target: '/latest',
        },
        {
            source: ['joshwcomeau.com/:category'],
            target: '/latest/:category',
        },
    ],
    name: 'Articles and Tutorials',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(ctx) {
    const category: string = ctx.req.param('category') || '';
    const currentUrl = category ? `${rootUrl}/${category}` : rootUrl;
    const selector = category ? 'div > article > a:first-child' : 'article[data-include-enter-animation="false"] > a:first-child';
    const { heading, urls } = await getRelativeUrlList(currentUrl, selector);
    const items = await processList(urls);
    const title = category ? `${heading} | ` : '';
    return {
        title: `${title}Articles and Tutorials | Josh W. Comeau`,
        description: `Friendly tutorials for developers. Focus on ${category ? title : 'React, CSS, Animation, and more!'}`,
        link: currentUrl,
        item: items,
        icon: `${rootUrl}/favicon.png`,
        logo: `${rootUrl}/favicon.png`,
    } as Data;
}
