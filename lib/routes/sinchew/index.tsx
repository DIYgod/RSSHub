import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/sinchew',
    radar: [
        {
            source: ['sinchew.com.my/'],
            target: '/',
        },
    ],
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    url: 'sinchew.com.my/',
};

export async function handler(ctx) {
    const subPath = getSubPath(ctx);

    const rootUrl = 'https://www.sinchew.com.my';
    const currentUrl = `${rootUrl}${subPath === '/' ? '' : subPath}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.title .internalLink')
        .slice(0, getRouteLimit(ctx, 20))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const link = $item.attr('href');
            const date = $item.text();

            return {
                title: $item.attr('data-title')!,
                link: link!.startsWith('http') ? link : `${rootUrl}${link}`,
                pubDate: date ? timezone(parseDate(date), 8) : undefined,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(`sinchew:article:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.ads-frame, .read-more-msg').remove();

                content('figure').each((_, el) => {
                    content(el).replaceWith(
                        renderToString(
                            <figure>
                                <img src={content(el).find('img').attr('src')} />
                                <figcaption>{content(el).find('figcaption').text()}</figcaption>
                            </figure>
                        )
                    );
                });

                item.description = content('.article-page-content').html();
                const date = content('meta[property="article:published_time"]').attr('content');
                if (date) {
                    item.pubDate = timezone(parseDate(date), 8);
                }

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
