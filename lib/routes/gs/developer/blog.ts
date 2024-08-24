import { Route, Data } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/developer/blog',
    categories: ['blog'],
    example: '/gs/developer/blog',
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
            source: ['developer.gs.com/blog/posts'],
            target: '/developer/blog',
        },
    ],
    name: 'Goldman Sachs Developer Blog',
    zh: {
        name: '高盛开发者博客',
    },
    maintainers: ['chesha1'],
    handler: handlerRoute,
};

async function handlerRoute(): Promise<Data> {
    const response = await ofetch('https://developer.gs.com/blog/posts');
    const $ = load(response);

    const items = $('div[data-cy="blog-card-grid"] a')
        .toArray()
        .map((item) => {
            const link = 'https://developer.gs.com' + $(item).attr('href');
            const title = $(item).find('span').eq(1).text();
            const author = $(item).find('span').eq(2).text();
            const description = $(item).find('span').eq(3).text();
            const pubDate = $(item).find('span').eq(0).text();
            return {
                title,
                link,
                author,
                description,
                pubDate,
            };
        });

    return {
        title: 'Goldman Sachs Developer Blog',
        link: 'https://developer.gs.com/blog/posts',
        item: items,
    };
}
