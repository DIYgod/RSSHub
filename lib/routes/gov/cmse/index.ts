import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export async function handler(ctx) {
    const limit = getRouteLimit(ctx, 15);
    // Detail timestamps can refine the calendar dates on the list page.
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(15, limit);
    const path = getSubPath(ctx).replaceAll(/(^\/cmse|\/$)/g, '');

    const rootUrl = 'http://www.cmse.gov.cn';
    const currentUrl = `${rootUrl}${path === '' ? '/xwzx/zhxw/' : `${path}/`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('#list li a')
        .slice(0, candidateLimit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const pubDate = $item.next().text();
            const link = new URL($item.attr('href')!, currentUrl).href;

            return {
                title: $item.text(),
                pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
                link: link.endsWith('.html') ? link : `${link}#${pubDate}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.share').remove();

                const detailPubTimeMatches = detailResponse.data.match(/__\$pubtime='(.*?)';var/);

                item.pubDate = detailPubTimeMatches?.[1] ? timezone(parseDate(detailPubTimeMatches[1]), 8) : item.pubDate;
                item.description = renderDescription({
                    video: content('#con_video').html() ?? undefined,
                    description: content('.TRS_Editor, #content').html() ?? undefined,
                });

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
