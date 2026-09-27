import { load } from 'cheerio';

import type { Route } from '@/types';

import { baseURL, get } from './utils';

export const route: Route = {
    path: '/platform/:name/:routeParams?',
    categories: ['programming'],
    example: '/alternativeto/platform/firefox',
    parameters: { name: 'Platform name', routeParams: 'Filters of software type' },
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
            source: ['www.alternativeto.net/platform/:name'],
            target: '/platform/:name',
        },
    ],
    name: 'Platform Software',
    maintainers: ['JimenezLi'],
    handler,
    description: '> routeParms can be copied from original site URL, example: `/alternativeto/platform/firefox/license=free`',
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const query = new URLSearchParams(ctx.req.param('routeParams'));
    const link = `https://alternativeto.net/platform/${name}/?${query.toString()}`;

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
