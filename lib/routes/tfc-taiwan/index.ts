import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseUrl, parseList, parseItems } from './utils';

export const route: Route = {
    path: ['/', '/category/:id{.+}', '/info', '/report', '/topic/:id'],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
    url: 'tfc-taiwan.org.tw/articles/report',
    url: 'tfc-taiwan.org.tw/articles/info',
};

async function handler(ctx) {
    const requestPath = ctx.req.path;
    const isTopic = requestPath.startsWith('/topic/');
    let link = baseUrl;

    if (isTopic) {
        link += `/topic/${ctx.req.param('id')}`;
    } else if (requestPath === '/') {
        link += `/articles/report`;
    } else {
        link += `/articles${requestPath}`;
    }

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $(`${isTopic ? '.view-grouping' : '.pane-clone-of-article'} .views-row-inner`)
        .toArray()
        .map((item) => parseList($(item)));

    const items = await parseItems(list, cache.tryGet);

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: $('head meta[property="og:image"]').attr('content'),
        logo: $('head link[rel="shortcut icon"]').attr('href'),
        icon: $('head link[rel="shortcut icon"]').attr('href'),
        link,
        item: items,
    };
}
