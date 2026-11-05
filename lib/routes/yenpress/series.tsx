import { load } from 'cheerio';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function getImageUrl(value: string | undefined, baseUrl: string): string | undefined {
    if (!value) {
        return;
    }
    try {
        const url = new URL(value, baseUrl);
        if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) {
            return url.href;
        }
    } catch {
        // Ignore unsupported source image URLs.
    }
    return;
}

function getReleaseDate(value: string | undefined): Date | undefined {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    // UTC midnight represents the release calendar day, not a publication instant.
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}

const render = (data: { cover?: string }) => renderToString(<SeriesDescription {...data} />);

export const route: Route = {
    path: '/series/:name',
    example: '/yenpress/series/alya-sometimes-hides-her-feelings-in-russian',
    parameters: { name: 'Series name' },
    name: 'Series',
    maintainers: ['TonyRL'],
    handler,
    radar: [
        {
            source: ['yenpress.com/series/:name'],
            target: '/series/:name',
        },
    ],
};

async function handler(ctx: Context) {
    const { name: series } = ctx.req.param();
    const baseUrl = 'https://yenpress.com';
    const link = `https://yenpress.com/series/${series}`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.show-more-container .inline_block')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('span').text(),
                link: new URL($item.find('a').attr('href')!, baseUrl).href,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const { description, pubDate, category, author } = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'category' | 'author'>>(`yenpress:book:v5:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const category = $('.detail-labels.mobile-only')
                    .eq(0)
                    .find('a')
                    .toArray()
                    .map((a) => $(a).text().trim());

                $('svg, .social-share, .desktop-only, .detail-labels').remove();

                $('.book-info img').each((_, node) => {
                    const image = $(node);
                    const src = getImageUrl(image.attr('src') || image.attr('data-src'), item.link!);
                    if (src) {
                        image.attr('src', src).removeAttr('data-src');
                    } else {
                        image.remove();
                    }
                });
                const cover = $('.book-info').find('.book-cover-img').html();

                const bookInfo = $('.buy-info .deliver')
                    .toArray()
                    .map((item, i) => ({
                        deliver: $(item).text().trim(),
                        price: $('.book-price').eq(i).text().trim(),
                        from: $('.services')
                            .eq(i)
                            .find('.service')
                            .toArray()
                            .map((service) => {
                                const a = $(service).find('a');
                                return {
                                    name: a.text().trim(),
                                    link: a.attr('href'),
                                };
                            }),
                        detail: $('.detail-info')
                            .eq(i)
                            .find('div span')
                            .toArray()
                            .map((span) => {
                                const $span = $(span);
                                return {
                                    key: $span.text().trim(),
                                    value: $span.next().text().trim(),
                                };
                            }),
                    }));

                const info = $('.book-info');
                const credits = info
                    .children('.story-details.mobile-only')
                    .find('p')
                    .toArray()
                    .map((node) => $(node).text())
                    .filter((text) => text.trim());
                const author = credits.length ? credits.join('; ') : undefined;
                info.find('.buy-info, .series-cover, .story-details.mobile-only').remove();

                const description = render({
                    cover: cover! + info.html(),
                });
                const releaseDate = bookInfo[0]?.detail.find((d) => d.key === 'Release Date')?.value;
                return {
                    description,
                    category,
                    pubDate: getReleaseDate(releaseDate),
                    author,
                };
            });
            return { ...item, description, pubDate: pubDate ?? undefined, category, author };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('head title').text(),
        description: $('.social-share p').text().trim(),
        link,
        item: items,
    };
}

const SeriesDescription = ({ cover }: { cover?: string }) => (
    <>
        {cover ? (
            <>
                {raw(cover)}
                <br />
            </>
        ) : null}
    </>
);
