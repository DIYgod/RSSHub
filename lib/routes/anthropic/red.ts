import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/red',
    categories: ['programming'],
    example: '/anthropic/red',
    radar: [
        {
            source: ['red.anthropic.com'],
        },
    ],
    name: 'Frontier Red Team',
    maintainers: ['shoeper'],
    handler,
    url: 'red.anthropic.com',
};

async function handler(ctx: Context) {
    const baseUrl = 'https://red.anthropic.com';
    const link = `${baseUrl}/red`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('a[class^="note"]')
        .toArray()
        .filter((element) => $(element).attr('href'))
        .slice(0, getRouteLimit(ctx))
        .map((element): DataItem => {
            const $e = $(element);
            return {
                title: $e.find('h2, h3').text().trim(),
                link: new URL($e.attr('href')!, baseUrl).href,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(`anthropic:red:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const publishedTime = $('meta[property="article:published_time"]').attr('content');
                const pubDate = publishedTime ? parseDate(publishedTime) : undefined;
                const isDashboard = new URL(item.link!).pathname === '/2026/cvd/';
                const content = isDashboard ? $('main') : $('[class^="Body-module-scss-module__"][class$="__body"]');
                if (isDashboard) {
                    content.find('h1, nav, .last-updated, .filters, .pager, .ledger-dash .controls, .ld-override-note, noscript').remove();
                    content.find('button').each((_, element) => {
                        $(element).replaceWith($(element).contents());
                    });
                    content.find('input, select, label').remove();
                } else {
                    content
                        .find(
                            '[class*="ExpandableSection-module-scss-module__"][class$="__toggleButton"], [class*="VideoEmbed-module-scss-module__"][class$="__play-button"], [class^="CodeBlock-module-scss-module__"][class$="__header"]'
                        )
                        .remove();
                    content.find('[class^="ExpandableSection-module-scss-module__"][class$="__content"]').removeAttr('inert hidden style');
                }
                content.find('script, style').remove();
                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset');
                    const src = $e.attr('src');
                    if (!src) {
                        return;
                    }
                    const imageUrl = new URL(src, item.link);
                    $e.attr('src', imageUrl.pathname === '/_next/image' ? imageUrl.searchParams.get('url') || imageUrl.href : imageUrl.href);
                });

                if (!content.text().trim()) {
                    throw new Error(`Unable to extract article content from ${item.link}: the page layout may have changed.`);
                }
                return {
                    ...item,
                    pubDate,
                    description: content.html(),
                };
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic Frontier Red Team',
        link,
        image: `${baseUrl}/anthropic-serve/favicon.ico`,
        item: items,
    };
}
