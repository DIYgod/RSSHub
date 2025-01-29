import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/opinion/vinetas',
    categories: ['traditional-media'],
    example: '/opinion/vinetas',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['publico.es/opinion/vinetas'],
            target: '/opinion/vinetas',
        },
    ],
    name: 'Viñetas | Opinión | Público',
    maintainers: ['adrianrico97'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.publico.es';
    const currentUrl = `${rootUrl}/opinion/vinetas`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.category-list li')
        .map((_, item) => {
            item = $(item);
            const title = item.find('h2').text();
            const link = item.find('a').attr('href');
            const author = item.find('p').text();
            const image = item.find('picture img').attr('src');

            return {
                title,
                link,
                description: `<img src="${image}" alt="${title}"><p>${author}</p>`,
            };
        })
        .get();

    return {
        title: 'Viñetas | Opinión | Público',
        link: currentUrl,
        item: items,
    };
}
