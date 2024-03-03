// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';

const { rootUrl, apiTopicUrl, art, processItems } = require('./util');

export default async (ctx) => {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(category ?? '', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const type = currentResponse.match(/\[\\"type\\",\\"(\d+)\\",\\"d\\"]/)?.[1] ?? '1';

    const { data: response } = await got(apiTopicUrl, {
        searchParams: {
            type,
            page: 1,
            size: limit,
        },
    });

    let items = response.data.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url ?? new URL(`topic/${item.uid}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            description: item.summary,
            news: item.newsAggList,
            timeline: item.timeline,
        }),
        author: item.siteNameDisplay,
        category: [...(item.entityList.map((c) => c.name) ?? []), ...(item.tagList.map((c) => c.name) ?? [])],
        guid: item.uid,
        pubDate: parseDate(item.publishDate),
    }));

    items = await processItems(items, cache.tryGet);

    const $ = load(currentResponse);

    const author = $('meta[property="og:site_name"]').prop('content');
    const subtitle = $(`a[data-path="/${category}"]`).text();
    const image = $('link[rel="preload"][as="image"]').prop('href');
    const icon = $('meta[property="og:image"]').prop('content');

    ctx.set('data', {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    });
};
