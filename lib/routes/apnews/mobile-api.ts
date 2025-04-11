import { Route, ViewType } from '@/types';
import { asyncPoolAll, fetchArticle } from './utils';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/mobile/:path{.+}?',
    categories: ['traditional-media'],
    example: '/apnews/mobile/ap-top-news',
    view: ViewType.Articles,
    parameters: {
        path: {
            description: 'Corresponding path from AP News website',
            default: 'ap-top-news',
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
    const path = ctx.req.param('path') ? `/${ctx.req.param('path')}` : '/hub/ap-top-news';
    const apiRootUrl = 'https://apnews.com/graphql/delivery/ap/v1';
    const res = await ofetch(apiRootUrl, {
        query: {
            operationName: 'ContentPageQuery',
            variables: { path },
            extensions: { persistedQuery: { version: 1, sha256Hash: '3bc305abbf62e9e632403a74cc86dc1cba51156d2313f09b3779efec51fc3acb' } },
        },
    });

    const screen = res.data.Screen;

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
            } else if (e.__typename === 'VideoPlaylistItem') {
                return {
                    title: e.title,
                    link: e.url,
                    description: e.description,
                    guid: e.contentId,
                };
            } else {
                return;
            }
        })
        .filter(Boolean)
        .sort((a, b) => b.pubDate - a.pubDate)
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20);

    const items = ctx.req.query('fulltext') === 'true' ? await asyncPoolAll(10, list, (item) => fetchArticle(item)) : list;

    return {
        title: screen.category ?? screen.title,
        item: items,
        link: 'https://apnews.com',
    };
}
