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
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://news.pts.org.tw';
    const currentUrl = `${rootUrl}${getSubPath(ctx) === '/' ? '/dailynews' : getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('h1 a,h2 a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.author = content('.reporter-container a')
                    .toArray()
                    .map((e) => ({ name: content(e).text() }));
                item.pubDate = timezone(parseDate(content('.article-time .mr-2 time').text()), +8);
                item.updated = timezone(parseDate(content('.article-time span:nth-child(2) time').text()), +8);
                item.category = content('.tag-list')
                    .first()
                    .find('.blue-tag')
                    .toArray()
                    .map((t) => content(t).text())
                    .filter((t) => t !== '...');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('meta[property="og:image"]').attr('content'),
                    description: content('.post-article').html(),
                });
                return item;
            })
        )
    );

    return {
        title: $('title')
            .text()
            .replace(/第\d+頁 ｜ /, ''),
        link: currentUrl,
        item: items,
    };
}
