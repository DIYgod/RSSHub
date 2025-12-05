import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '*',
    radar: [
        {
            source: ['sinchew.com.my/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'sinchew.com.my/',
};

async function handler(ctx) {
    const rootUrl = 'https://www.sinchew.com.my';
    const currentUrl = `${rootUrl}${getSubPath(ctx) === '/' ? '' : getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.title .internalLink')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.attr('data-title'),
                link: link.startsWith('http') ? link : `${rootUrl}${link}`,
                pubDate: timezone(parseDate(item.text()), +8),
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

                content('.ads-frame, .read-more-msg').remove();

                content('figure').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/images.art'), {
                            image: content(this).find('img').attr('src'),
                            caption: content(this).find('figcaption').text(),
                        })
                    );
                });

                item.description = content('.article-page-content').html();
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);

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
