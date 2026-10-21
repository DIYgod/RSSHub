import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    name: '最近更新',
    url: 'fanxinzhui.com/lastest',
    maintainers: ['nczitzk'],
    handler,
    example: '/fanxinzhui',
    categories: ['multimedia'],

    radar: [
        {
            source: ['fanxinzhui.com/lastest'],
            target: '/',
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://www.fanxinzhui.com';
    const currentUrl = new URL('lastest', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('a.la')
        .slice(0, Math.max(30, limit))
        .toArray()
        .map((item) => {
            const $item = $(item);

            const season = $item.find('span.season').text();
            const name = $item.find('span.name').text();
            const link = new URL($item.prop('href')!, rootUrl).href;

            return {
                title: `${season} ${name}`,
                link,
                guid: `${link}#${season}`,
                pubDate: timezone(parseDate($item.find('span.time').text()), 8),
            };
        });

    const sorted = ctx.req.query('sorted') !== 'false';
    const allDated = items.every((item) => Number.isFinite(item.pubDate.getTime()));
    if (sorted && allDated) {
        items = items.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    }
    if (!sorted || allDated) {
        items = items.slice(0, limit);
    }

    const links = [...new Set(items.map((item) => item.link))];
    const details = new Map(
        await pMap(
            links,
            async (link) => {
                const detail = await cache.tryGet(`${link}#article`, async () => {
                    const { data: detailResponse } = await got(link);

                    const content = load(detailResponse);

                    let author: string | undefined;
                    let category: string[] = [];

                    content('div.info ul li').each((_, el) => {
                        const $el = content(el);

                        const key = $el.find('span').text().split(/:/, 1)[0];
                        const value = $el.contents().last().text().trim();

                        if (key === '类型') {
                            category = [...category, ...value.split(/\//)];
                        } else if (key === '首播日期') {
                            return;
                        } else {
                            author = `${author ? `${author}/` : ''}${value}`;
                        }
                    });

                    content('div.image').each((_, el) => {
                        const $el = content(el);

                        const image = $el.find('img').prop('src');

                        $el.replaceWith(
                            renderDescription(
                                image
                                    ? [
                                          {
                                              src: image.replace(/@\d+,\d+\.\w+$/, ''),
                                              alt: content('div.resource_title h2').text(),
                                          },
                                      ]
                                    : undefined
                            )
                        );
                    });

                    content('a.password').each((_, el) => {
                        const $el = content(el);

                        $el.replaceWith($el.text());
                    });

                    content('div.resource_title, div.info ul').remove();

                    return {
                        author,
                        category,
                        description: content('div.middle_box').html(),
                    };
                });
                return [link, detail] as const;
            },
            { concurrency: 3 }
        )
    );
    items = items.map((item) => ({ ...item, ...details.get(item.link) }));

    const title = $('title').text();
    const image = new URL($('img.logo').prop('src')!, rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        author: title.split(/_/).pop(),
    };
}

const renderDescription = (images: Array<{ src?: string; alt?: string }> | undefined): string =>
    renderToString(
        <>
            {images?.map((image, index) =>
                image?.src ? (
                    <figure key={`${image.src}-${index}`}>
                        <img src={image.src} alt={image.alt} />
                    </figure>
                ) : null
            )}
        </>
    );
