import { Route, ViewType } from '@/types';
import { fetchArticle } from './utils';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/api/:tags?',
    categories: ['traditional-media', 'popular'],
    example: '/apnews/api/business',
    view: ViewType.Articles,
    parameters: {
        tags: {
            description: 'See https://github.com/kovidgoyal/calibre/blob/81666219718b5f57d56b149a7ac017cc2a76b931/recipes/ap.recipe#L43-L46',
            default: 'apf-topnews',
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
    name: 'News',
    maintainers: ['zoenglinghou', 'mjysci', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const { tags = 'apf-topnews' } = ctx.req.param();
    const apiRootUrl = 'https://afs-prod.appspot.com/api/v2/feed/tag';
    const url = `${apiRootUrl}?tags=${tags}`;
    const res = await ofetch(url);

    const list = res.cards.map((e) => ({
        title: e.contents[0].headline,
        link: e.contents[0].localLinkUrl,
    }));

    const items = await Promise.all(list.map((item) => fetchArticle(item)));

    return {
        title: `${res.tagObjs[0].name} - AP News`,
        item: items,
    };
}
