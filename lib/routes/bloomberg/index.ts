import { Route } from '@/types';
import { rootUrl, asyncPoolAll, parseNewsList, parseArticle } from './utils';
const site_title_mapping = {
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
    example: '/bloomberg/bbiz',
    parameters: {
        site: 'Site ID, can be found below',
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
    const items = await asyncPoolAll(1, list, (item) => parseArticle(item));
    return {
        title: `Bloomberg - ${site_title_mapping[site ?? '/']}`,
        link: currentUrl,
        item: items,
    };
}
