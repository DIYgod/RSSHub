import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import rssParser from '@/utils/rss-parser';

import { parseArticle, rootUrl } from './utils';

const siteTitleMapping = {
    '/': 'News',
    politics: 'Politics',
    business: 'Business',
    markets: 'Markets',
    technology: 'Technology',
    wealth: 'Wealth',
    bview: 'Opinion',
    businessweek: 'Businessweek',
    economics: 'Economics',
    industries: 'Industries',
    crypto: 'Crypto',
};

// Bloomberg removed the per-site news sitemaps; map legacy site IDs to the equivalent RSS feeds
const legacySiteMapping = {
    bpol: 'politics',
    bbiz: 'business',
};

export const route: Route = {
    path: '/:site?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/bloomberg/business',
    parameters: {
        site: {
            description: 'Site ID, can be found below',
            options: Object.entries(siteTitleMapping).map(([key, value]) => ({ value: key, label: value })),
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
    description: `| Site ID      | Title        |
| ------------ | ------------ |
| /            | News         |
| politics     | Politics     |
| business     | Business     |
| markets      | Markets      |
| technology   | Technology   |
| wealth       | Wealth       |
| bview        | Opinion      |
| businessweek | Businessweek |
| economics    | Economics    |
| industries   | Industries   |
| crypto       | Crypto       |

Legacy site IDs \`bpol\` and \`bbiz\` still work as aliases of \`politics\` and \`business\`.`,
    handler,
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const mappedSite = site ? (legacySiteMapping[site] ?? site) : undefined;
    const currentUrl = mappedSite ? `${rootUrl}/${mappedSite}/news.rss` : `${rootUrl}/news.rss`;

    const feed = await rssParser.parseString(await ofetch(currentUrl));
    const list = feed.items.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50).map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
        description: item.content,
    }));
    const items = await pMap(list, (item) => parseArticle(item), { concurrency: 1 });
    return {
        title: `Bloomberg - ${siteTitleMapping[mappedSite ?? '/'] ?? feed.title}`,
        link: feed.link ?? currentUrl,
        item: items,
    };
}
