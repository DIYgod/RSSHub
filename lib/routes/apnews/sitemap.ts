import { Route, ViewType } from '@/types';
import { fetchArticle } from './utils';
import pMap from 'p-map';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const HOME_PAGE = 'https://apnews.com';

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
    const response = await ofetch(url);
    const $ = load(response);

    const list = $('urlset url')
        .toArray()
        .map((e) => {
            const LANGUAGE_MAP = new Map([
                ['eng', 'en'],
                ['spa', 'es'],
            ]);

            const title = $(e)
                .find(String.raw`news\:title`)
                .text();
            const pubDate = parseDate(
                $(e)
                    .find(String.raw`news\:publication_date`)
                    .text()
            );
            const lastmod = timezone(parseDate($(e).find(`lastmod`).text()), -4);
            const language = LANGUAGE_MAP.get(
                $(e)
                    .find(String.raw`news\:language`)
                    .text()
            );
            let res = { link: $(e).find('loc').text() };
            if (title) {
                res = Object.assign(res, { title });
            }
            if (pubDate.toString() !== 'Invalid Date') {
                res = Object.assign(res, { pubDate });
            }
            if (language) {
                res = Object.assign(res, { language });
            }
            if (lastmod.toString() !== 'Invalid Date') {
                res = Object.assign(res, { lastmod });
            }
            return res;
        })
        .filter((e) => Boolean(e.link) && !new URL(e.link).pathname.split('/').includes('hub'))
        .toSorted((a, b) => (a.pubDate && b.pubDate ? b.pubDate - a.pubDate : b.lastmod - a.lastmod))
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20);

    const items = ctx.req.query('fulltext') === 'true' ? await pMap(list, (item) => fetchArticle(item), { concurrency: 20 }) : list;

    return {
        title: `AP News sitemap:${route}`,
        item: items,
        link: 'https://apnews.com',
    };
}
