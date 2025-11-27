import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { ProcessItems, rootUrl } from './utils';

export async function handler(ctx) {
    const { type, id } = ctx.req.param();

    const currentUrl = type ? `${rootUrl}/${type}/${id}.htm` : rootUrl;

    let response = await got(currentUrl);

    const $ = load(response.data);

    const token = encodeURI($('meta[name="csrf-token"]').attr('content'));
    const apiUrl = `${rootUrl}/home/more?&type=${$('div[data-type]').data('type')}&page=1&_csrf=${token}&_=${Date.now()}`;

    response = await got(apiUrl);

    const items = type
        ? response.data.result.list.map((item) => ({
              title: item.title,
              description: item.hometext,
              author: item.source.split('@http')[0],
              pubDate: timezone(parseDate(item.inputtime), +8),
              link: item.url_show.startsWith('//') ? `https:${item.url_show}` : item.url_show.replace('http:', 'https:'),
              category: item.label.name,
          }))
        : response.data.result.map((item) => ({
              title: item.title,
              link: item.url_show.startsWith('//') ? `https:${item.url_show}` : item.url_show.replace('http:', 'https:'),
              category: item.label.name,
          }));

    return {
        title: $('title').text(),
        link: currentUrl,
        item: await ProcessItems(items, ctx.req.query('limit'), cache.tryGet),
    };
}
