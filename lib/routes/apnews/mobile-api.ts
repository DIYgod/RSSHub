import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { fetchArticle, fetchScreen } from './utils';

export const route: Route = {
    path: '/mobile/:path{.+}?',
    categories: ['traditional-media'],
    example: '/apnews/mobile',
    view: ViewType.Articles,
    parameters: {
        path: {
            description: 'Corresponding path from AP News website',
            default: '/',
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
    name: 'News (from mobile client API)',
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const path = ctx.req.param('path') ? `/${ctx.req.param('path')}` : '/';
    const screen = await fetchScreen(path);

    const list = [...screen.main.filter((e) => e.__typename === 'ColumnContainer').flatMap((_) => _.columns), ...screen.main.filter((e) => e.__typename !== 'ColumnContainer')]
        .filter((e) => e.__typename !== 'GoogleDfPAdModule')
        .flatMap((e) => {
            switch (e.__typename) {
                case 'PageListModule':
                    return e.items;
                case 'VideoPlaylistModule':
                    return e.playlist;
                default:
                    return;
            }
        })
        .filter(Boolean)
        .map((e) => {
            if (e.__typename === 'PagePromo') {
                return {
                    title: e.title,
                    link: e.url,
                    pubDate: parseDate(e.publishDateStamp),
                    category: e.category,
                    description: e.description,
                    guid: e.id,
                };
            }
            if (e.__typename === 'VideoPlaylistItem') {
                return {
                    title: e.title,
                    link: e.url,
                    description: e.description,
                    guid: e.contentId,
                };
            }
            return;
        })
        .filter(Boolean)
        .toSorted((a, b) => Number(b!.pubDate) - Number(a!.pubDate))
        .slice(0, getRouteLimit(ctx, 20));

    const items = ctx.req.query('fulltext') === 'true' ? await pMap(list, (item) => fetchArticle(item), { concurrency: 10 }) : list;

    return {
        title: screen.category ?? screen.title,
        item: items,
        link: 'https://apnews.com',
    };
}
