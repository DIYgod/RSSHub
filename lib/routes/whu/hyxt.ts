// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const { domain, processMeta, getMeta, processItems } = require('./util');

export default async (ctx) => {
    const { category = 'tzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = `https://hyxt.${domain}`;
    const currentUrl = new URL(`${category}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('tr.content-title')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('td a');

            return {
                title: a.text(),
                link: new URL(a.prop('href'), rootUrl).href,
                pubDate: parseDate(item.find('td').last().text()),
            };
        });

    items = await processItems(items, cache.tryGet, rootUrl);

    const meta = processMeta(response);
    const siteName = getMeta(meta, 'SiteName');
    const columnName = getMeta(meta, 'ColumnName');

    ctx.set('data', {
        item: items,
        title: `${siteName} - ${columnName}`,
        link: currentUrl,
        description: getMeta(meta, 'ColumnKeywords'),
        language: $('html').prop('lang'),
        image: new URL($('div.top-logo img').prop('src'), rootUrl).href,
        subtitle: columnName,
        author: siteName,
        allowEmpty: true,
    });
};
