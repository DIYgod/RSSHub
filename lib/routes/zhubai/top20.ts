// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const parseContent = (content) =>
    art(path.join(__dirname, 'templates/description.art'), {
        content,
    });

art.defaults.imports.parseContent = parseContent;

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'http://analy.zhubai.wiki';
    const apiRootUrl = 'https://open.zhubai.wiki';
    const apiUrl = new URL('a/zb/s/ht/pl/wk', apiRootUrl).href;

    const { data: response } = await got.post(apiUrl);

    let items = response.data.slice(0, limit).map((item) => ({
        title: item.pn,
        link: item.fp ?? item.pq ?? item.pu,
        description: item.pa,
        author: item.zn,
        pubDate: parseRelativeDate(item.lu.replace(/\.\d+/, '')),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const matches = item.link.match(/\/(?:fp|pq|pu)\/([\w-]+)\/(\d+)/);

                const { data } = await got(`https://${matches[1]}.zhubai.love/api/posts/${matches[2]}`);

                item.title = data.title ?? item.title;
                item.description = data.content ? parseContent(JSON.parse(data.content)) : item.description;
                item.author = data.author?.name ?? item.author;
                item.pubDate = data.created_at ? parseDate(data.created_at) : item.pubDate;

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(rootUrl);

    const $ = load(currentResponse);

    const icon = $('link[rel="apple-touch-icon"]').prop('href');

    ctx.set('data', {
        item: items,
        title: `${$('meta[property="og:title"]').prop('content')} - TOP20`,
        link: rootUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="og:description"]').prop('content'),
        author: $('meta[name="twitter:site"]').prop('content'),
    });
};
