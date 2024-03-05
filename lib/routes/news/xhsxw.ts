// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'http://www.news.cn';
    const currentUrl = new URL('xhsxw.htm', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const id = $('ul.wz-list')
        .prop('data')
        .replace(/datasource:/, '');

    const apiUrl = new URL(`ds_${id}.json`, rootUrl).href;

    const {
        data: { datasource: response },
    } = await got(apiUrl);

    let items = response.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(item.publishUrl, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            images:
                item.shareImages?.map((i) => ({
                    src: i.imageUrl,
                    alt: item.title,
                })) ?? undefined,
            intro: item.summary,
        }),
        author: item.author,
        category: item.keywords.split(/-|,/),
        guid: `news-${item.contentId}`,
        pubDate: timezone(parseDate(item.publishTime), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    item.description += art(path.join(__dirname, 'templates/description.art'), {
                        description: content('#detailContent').html(),
                    });
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL('20141223_xhsxw_logo_v1.png', rootUrl).href;
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('data', {
        item: items,
        title,
        link: currentUrl,
        description: title.split(/_/)[0],
        language: 'zh',
        image,
        icon,
        logo: icon,
        author: title.split(/_/).pop(),
        allowEmpty: true,
    });
};
