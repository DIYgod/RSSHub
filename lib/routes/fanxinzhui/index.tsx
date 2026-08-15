import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
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

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const rootUrl = 'https://www.fanxinzhui.com';
    const currentUrl = new URL('lastest', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('a.la')
        .slice(0, limit)
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

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

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
                        category = [...category, ...value.split(/\//)].filter((c) => c !== '等');
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

                return {
                    ...item,
                    author,
                    category,
                    description: content('div.middle_box').html(),
                    enclosure_url: content('p.way span a').prop('href'),
                };
            })
        )
    );

    const title = $('title').text();
    const image = new URL($('img.logo').prop('src')!, rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh' as Language,
        image,
        author: title.split(/_/).pop(),
        allowEmpty: true,
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
