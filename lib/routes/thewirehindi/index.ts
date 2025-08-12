import { Data, Route } from '@/types';
import got from '@/utils/got';
import { mapPostToItem } from './utils';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/thewirehindi',
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
            source: ['thewirehindi.com/'],
        },
    ],
    name: 'Latest News',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'thewirehindi.com/',
};

async function handler() {
    const apiUrl = 'https://thewirehindi.com/wp-json/wp/v2/posts?_embed';
    const { data } = await got(apiUrl);

    const items = data.map((v) => mapPostToItem(v));

    return {
        title: 'The Wire Hindi - Latest News',
        link: 'https://thewirehindi.com/',
        item: items,
        description: 'Latest news from The Wire Hindi',
        logo: 'https://thewirehindi.com/wp-content/uploads/2023/05/cropped-The-wire-32x32.jpeg',
        language: 'hi',
    } as Data;
}
