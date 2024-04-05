import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

import { rootUrl, title, categories, convertToQueryString, getInfo, processItems } from './util';

export const route: Route = {
    path: '/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    let { category = 'new' } = ctx.req.param();

    let newTitle = '';

    if (!/^(\w+\/\w+)$/.test(category)) {
        newTitle = `${title} - ${Object.hasOwn(categories, category) ? categories[category] : categories[Object.keys(categories)[0]]}`;
        category = `ac/${category}`;
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const queryString = convertToQueryString(category);
    const currentUrl = new URL(`newsclass.aspx${queryString}`, rootUrl).href;

    const apiUrl = new URL(`m/newslist.ashx${queryString}`, rootUrl).href;

    const { data: response } = await got(apiUrl);

    const $ = load(response);

    let items = $('li[data-id]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('div.news_title').text(),
                link: new URL(item.find('div.news_title span.newst a').prop('href'), rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: item.find('a.newsimg img').prop('src'),
                }),
                author: item.find('p.tname').text(),
                guid: item.prop('data-id'),
                pubDate: timezone(parseDate(item.find('p.ttime').text()), +8),
                comments: item.find('a.tpinglun').text() ? Number.parseInt(item.find('a.tpinglun').text(), 10) : 0,
            };
        });

    items = await processItems(items, cache.tryGet);

    return {
        ...(await getInfo(currentUrl, cache.tryGet)),
        ...Object.fromEntries(
            Object.entries({
                item: items,
                title: newTitle,
            }).filter(([value]) => value)
        ),
    };
}
