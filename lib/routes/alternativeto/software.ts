import { load } from 'cheerio';

import type { Route } from '@/types';

import { baseURL, get } from './utils';

export const route: Route = {
    path: '/software/:name/:routeParams?',
    categories: ['programming'],
    example: '/alternativeto/software/cpp',
    parameters: { name: 'Software name', routeParams: 'Filters of software type' },
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
            source: ['www.alternativeto.net/software/:name'],
            target: '/software/:name',
        },
    ],
    name: 'Software Alternatives',
    maintainers: ['JimenezLi'],
    handler,
    description: '> routeParms can be copied from original site URL, example: `/alternativeto/software/cpp/license=opensource&platform=windows`',
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const query = new URLSearchParams(ctx.req.param('routeParams'));
    const link = `https://alternativeto.net/software/${name}/?${query.toString()}`;

    const html = await get(link);
    const $ = load(html);

    return {
        title: $('h1').contents().first().text(),
        description: $('.intro-text').text(),
        link,
        item: $('[data-testid^="item-"]')
            .toArray()
            .map((element) => {
                const item = $(element);
                const title = item.find('h2').text();
                const link = `${baseURL}${item.find('[data-testid="app-header"] a').attr('href')}`;
                const description = item.find('[data-testid="main-app-info"] p').text();

                return {
                    title,
                    link,
                    description,
                };
            }),
    };
}
