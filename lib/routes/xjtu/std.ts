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
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'http://std.xjtu.edu.cn';
    const currentUrl = `${rootUrl}/tzgg${category ? `/${category}` : ''}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.c1017')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = art(path.join(__dirname, 'templates/std.art'), {
                    description: content('#vsb_newscontent').html(),
                    attachments: content('#vsb_newscontent').parent().next().next().next().html(),
                });
                item.pubDate = timezone(parseDate(content('#vsb_newscontent').parent().prev().prev().text().split('&nbsp')[0], 'YYYY年MM月DD日 HH:mm'), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
