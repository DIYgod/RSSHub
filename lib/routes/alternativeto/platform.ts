import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';

import { baseURL, puppeteerGet } from './utils';

export const route: Route = {
    path: '/platform/:name/:routeParams?',
    categories: ['programming'],
    example: '/alternativeto/platform/firefox',
    parameters: { name: 'Platform name', routeParams: 'Filters of software type' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
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
    description: `> routeParms can be copied from original site URL, example: \`/alternativeto/platform/firefox/license=free\``,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const query = new URLSearchParams(ctx.req.param('routeParams'));
    const link = `https://alternativeto.net/platform/${name}/?${query.toString()}`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(link, cache);
    const $ = load(html);

    return {
        title: $('.Heading_h1___Cf5Y').text().trim(),
        description: $('.intro-text').text().trim(),
        link,
        item: $('.AppListItem_appInfo__h9cWP')
            .toArray()
            .map((element) => {
                const item = $(element);
                const title = item.find('.Heading_h2___LwQD').text().trim();
                const link = `${baseURL}${item.find('.Heading_h2___LwQD a').attr('href')}`;
                const description = item.find('.AppListItem_description__wtODK').text().trim();

                return {
                    title,
                    link,
                    description,
                };
            }),
    };
}
