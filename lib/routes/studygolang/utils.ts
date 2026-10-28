import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

const FetchGoItems = async (ctx, rewriteId?) => {
    const id = rewriteId || (ctx.req.param('id') ?? 'weekly');
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 50;

    const rootUrl = 'https://studygolang.com';
    const currentUrl = `${rootUrl}/go/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.right-info .title')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('a');

            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                author: $item.next().find('.author').text(),
                category: $item
                    .next()
                    .find('.node')
                    .toArray()
                    .map((n) => $(n).text()),
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`studygolang:article:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const publishedAt = content('.timeago').first().attr('title');
                const pubDate = publishedAt ? parseDateInTimezone(publishedAt, 8) : undefined;

                let description: string | undefined;
                try {
                    description = md.render(content('.content').text());
                } catch {
                    // no-empty
                }

                return { pubDate, description };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `Go语言中文网 - ${$('.title h2').text()}`,
        link: currentUrl,
        item: items,
    };
};

export { FetchGoItems };
