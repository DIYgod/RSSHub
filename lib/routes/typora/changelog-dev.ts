import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/changelog/dev',
    categories: ['program-update'],
    example: '/typora/changelog/dev',
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
            source: ['support.typora.io/'],
            target: '/changelog',
        },
    ],
    name: 'Dev Release Changelog',
    maintainers: ['nczitzk'],
    handler,
    url: 'support.typora.io/',
};

async function handler() {
    const currentUrl = 'https://typora.io/releases/dev';
    const response = await got(currentUrl);

    const $ = load(response.data);

    const items = $('h2')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${currentUrl}#${item.text()}`,
                description: item
                    .nextUntil('h2')
                    .toArray()
                    .map((item) => $(item).html())
                    .join(''),
            };
        });

    return {
        title: `Typora Changelog - Dev`,
        link: currentUrl,
        description: 'Typora Changelog',
        item: items,
    };
}
