import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';

import { parseArticle, parseNewsList, rootUrl } from './utils';

const siteTitleMapping = {
    '/': 'News',
    bpol: 'Politics',
    bbiz: 'Business',
    markets: 'Markets',
    technology: 'Technology',
    green: 'Green',
    wealth: 'Wealth',
    pursuits: 'Pursuits',
    bview: 'Opinion',
    equality: 'Equality',
    businessweek: 'Businessweek',
    citylab: 'CityLab',
};

export const route: Route = {
    path: '/:site?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/bloomberg/bbiz',
    parameters: {
        site: {
            description: 'Site ID, can be found below',
            options: Object.keys(siteTitleMapping).map((key) => ({ value: key, label: siteTitleMapping[key] })),
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Bloomberg Site',
    maintainers: ['bigfei'],
    description: `
| Site ID      | Title        |
| ------------ | ------------ |
| /            | News         |
| bpol         | Politics     |
| bbiz         | Business     |
| markets      | Markets      |
| technology   | Technology   |
| green        | Green        |
| wealth       | Wealth       |
| pursuits     | Pursuits     |
| bview        | Opinion      |
| equality     | Equality     |
| businessweek | Businessweek |
| citylab      | CityLab      |
  `,
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const currentUrl = site ? `${rootUrl}/${site}/sitemap_news.xml` : `${rootUrl}/sitemap_news.xml`;

    const list = await parseNewsList(currentUrl, ctx);
    const items = await pMap(list, (item) => parseArticle(item), { concurrency: 1 });
    return {
        title: `Bloomberg - ${siteTitleMapping[site ?? '/']}`,
        link: currentUrl,
        item: items,
    };
}
