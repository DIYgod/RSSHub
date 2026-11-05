import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { fetchArticle, fetchMetadata, fetchPage } from './utils';

const HOME_PAGE = 'https://apnews.com';
const languageMap = new Map([
    ['eng', 'en'],
    ['spa', 'es'],
]);

export const route: Route = {
    path: '/sitemap/:route',
    categories: ['traditional-media'],
    example: '/apnews/sitemap/ap-sitemap-latest',
    view: ViewType.Articles,
    parameters: {
        route: {
            description: 'Route for sitemap, excluding the `.xml` extension',
        },
    },
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
            source: ['apnews.com/'],
        },
    ],
    name: 'Sitemap',
    maintainers: ['zoenglinghou', 'mjysci', 'TonyRL', 'dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const route = ctx.req.param('route');
    const url = `${HOME_PAGE}/${route}.xml`;
    const response = await fetchPage(url);
    const $ = load(response);

    const list = $('urlset url')
        .toArray()
        .map((e) => {
            const title = $(e)
                .find(String.raw`news\:title`)
                .text();
            const pubDate = parseDate(
                $(e)
                    .find(String.raw`news\:publication_date`)
                    .text()
            );
            const updated = parseDate($(e).find('lastmod').text());
            const language = languageMap.get(
                $(e)
                    .find(String.raw`news\:language`)
                    .text()
            );
            let res: DataItem & { link: string } = { link: $(e).find('loc').text(), title: '' };
            if (title) {
                res = Object.assign(res, { title });
            }
            if (pubDate.toString() !== 'Invalid Date') {
                res = Object.assign(res, { pubDate });
            }
            if (language) {
                res = Object.assign(res, { language });
            }
            if (updated.toString() !== 'Invalid Date') {
                res = Object.assign(res, { updated });
            }
            return res;
        })
        .filter((e) => Boolean(e.link) && !new URL(e.link).pathname.split('/').includes('hub'))
        .toSorted((a, b) => (a.pubDate && b.pubDate ? Number(b.pubDate) - Number(a.pubDate) : Number(b.updated) - Number(a.updated)))
        .slice(0, getRouteLimit(ctx, 20));

    const metadataItems = await pMap(
        list,
        async (item) => {
            if (item.title) {
                return item;
            }
            const metadata = await fetchMetadata(item.link);
            return { ...item, ...metadata };
        },
        { concurrency: 3 }
    );

    const items = ctx.req.query('fulltext') === 'true' ? await pMap(metadataItems, (item) => fetchArticle(item), { concurrency: 3 }) : metadataItems;

    return {
        title: `AP News sitemap:${route}`,
        item: items,
        link: 'https://apnews.com',
    };
}
