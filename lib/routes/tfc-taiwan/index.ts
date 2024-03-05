// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl, parseList, parseItems } = require('./utils');

export default async (ctx) => {
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

    ctx.set('data', {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: $('head meta[property="og:image"]').attr('content'),
        logo: $('head link[rel="shortcut icon"]').attr('href'),
        icon: $('head link[rel="shortcut icon"]').attr('href'),
        link,
        item: items,
    });
};
