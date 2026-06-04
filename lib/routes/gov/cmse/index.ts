import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/cmse/*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const path = getSubPath(ctx).replaceAll(/(^\/cmse|\/$)/g, '');

    const rootUrl = 'http://www.cmse.gov.cn';
    const currentUrl = `${rootUrl}${path === '' ? '/xwzx/zhxw/' : `${path}/`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('#list li a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15)
        .toArray()
        .map((item) => {
            item = $(item);

            const pubDate = item.next().text();
            const link = new URL(item.attr('href'), currentUrl).href;

            return {
                title: item.text(),
                pubDate: parseDate(pubDate),
                link: link.endsWith('.html') ? link : `${link}#${pubDate}`,
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

                content('.share').remove();

                const detailPubTimeMatches = detailResponse.data.match(/__\$pubtime='(.*?)';var/);

                item.pubDate = detailPubTimeMatches ? timezone(parseDate(detailPubTimeMatches[1]), +8) : item.pubDate;
                item.description = renderDescription({
                    video: content('#con_video').html(),
                    description: content('.TRS_Editor, #content').html(),
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
