import { Route, ViewType } from '@/types';
import { fetchArticle } from './utils';
import ofetch from '@/utils/ofetch';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/api/:tags?',
    categories: ['traditional-media'],
    example: '/apnews/api/business',
    view: ViewType.Articles,
    parameters: {
        tags: {
            description: 'Getting a list of articles from a public API based on tags. See https://github.com/kovidgoyal/calibre/blob/81666219718b5f57d56b149a7ac017cc2a76b931/recipes/ap.recipe#L43-L46',
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
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler(ctx) {
    const { tags = 'apf-topnews' } = ctx.req.param();
    const apiRootUrl = 'https://afs-prod.appspot.com/api/v2/feed/tag';
    const url = `${apiRootUrl}?tags=${tags}`;
    const res = await ofetch(url);

    const list = res.cards
        .map((e) => ({
            title: e.contents[0]?.headline,
            link: e.contents[0]?.localLinkUrl,
            pubDate: timezone(parseDate(e.publishedDate), 0),
            category: e.tagObjs.map((tag) => tag.name),
            updated: timezone(parseDate(e.contents[0]?.updated), 0),
            description: e.contents[0]?.storyHTML,
            author: e.contents[0]?.reporters.map((author) => ({ name: author.displayName })),
        }))
        .sort((a, b) => b.pubDate - a.pubDate)
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20);

    const items = ctx.req.query('mode') === 'fulltext' ? await Promise.all(list.map((item) => fetchArticle(item))) : list;

    return {
        title: `${res.tagObjs[0].name} - AP News`,
        item: items,
        link: 'https://apnews.com',
    };
}
