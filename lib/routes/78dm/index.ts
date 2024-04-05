import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://www.78dm.net';
    const currentUrl = `${rootUrl}${getSubPath(ctx) === '/' ? '/news' : /\/\d+$/.test(getSubPath(ctx)) ? `${getSubPath(ctx)}.html` : getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.card-title')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: /^\/\//.test(link) ? `https:${link}` : link,
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

                content('.tag, .level').remove();
                content('.lazy').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/image.art'), {
                            image: content(this).attr('data-src'),
                        })
                    );
                });

                item.author = content('.push-username').first().text().split('楼主')[0];
                item.pubDate = timezone(
                    parseDate(
                        content('.push-time')
                            .first()
                            .text()
                            .match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1]
                    ),
                    +8
                );
                item.description = content('.image-text-content').first().html();

                return item;
            })
        )
    );

    return {
        title: `78动漫 - ${$('title').text().split('_')[0]} - ${$('.actived').first().text()}`,
        link: currentUrl,
        item: items,
    };
}
