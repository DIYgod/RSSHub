import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

const renderDescription = ({ images, description }: { images?: DescriptionImage[]; description?: string }) =>
    renderToString(
        <>
            {images?.map((image) =>
                image?.src ? (
                    <figure>
                        <img src={image.src} alt={image.alt ?? undefined} />
                    </figure>
                ) : null
            )}
            {description ? <>{raw(description)}</> : null}
        </>
    );

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const baseUrl = 'https://augmentcode.com';
    const targetUrl: string = new URL('blog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('div[data-slot="card"]')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('div[data-slot="card-content"]').text();
            const pubDateStr: string | undefined = $el.find('div[data-slot="card-footer"] p').last().text();
            const linkUrl: string | undefined = $el.parent().attr('href');
            const authorEls: Element[] = $el.find('div[data-slot="card-footer"] p').first().find('span').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.contents().first().text(),
                    url: undefined,
                    avatar: undefined,
                };
            });
            const image: string | undefined = $el.find('div[data-slot="card-header"] img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('article h1').text();
                const image: string | undefined = $$('meta[property="og:image"]').attr('content') ?? item.image;
                const description: string | undefined = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: $$('div.prose').html() ?? undefined,
                });
                const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                const authorEls: Element[] = $$('meta[property="article:author"]').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.attr('content'),
                        url: undefined,
                        avatar: undefined,
                    };
                });
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: title.split(/-/).pop()?.trim(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'augmentcode.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/augmentcode/blog',
    parameters: undefined,
    description: undefined,
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['augmentcode.com/blog'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
};
