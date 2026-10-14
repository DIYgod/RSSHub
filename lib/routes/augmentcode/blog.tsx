import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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
    const limit = getRouteLimit(ctx, 50);

    const baseUrl = 'https://augmentcode.com';
    const targetUrl: string = new URL('blog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('a[href^="/blog/"]:has(h2, h3)')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('h2, h3').first().text();
            const timestamp = $el
                .find('[title^="Unix:"]')
                .first()
                .attr('title')
                ?.match(/^Unix:\s*(\d+)$/)?.[1];
            const image = $el
                .find('img')
                .filter((_, image) => $(image).attr('alt') === title)
                .first()
                .attr('src');
            const authors = $el
                .find('[class*="-space-x"] img')
                .toArray()
                .map((image) => ({ name: $(image).attr('alt')! }));
            return {
                title,
                link: new URL($el.attr('href')!, baseUrl).href,
                pubDate: timestamp ? parseDate(Number(timestamp)) : undefined,
                author: authors,
                image: image ? new URL(image, baseUrl).href : undefined,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1').first().text();
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
                        name: $$authorEl.attr('content')!,
                        url: undefined,
                        avatar: undefined,
                    };
                });
                const articleMetadata = $$('script[type="application/ld+json"]')
                    .toArray()
                    .map((el) => JSON.parse($$(el).text()))
                    .find((metadata) => metadata['@type'] === 'BlogPosting');
                const upDatedStr: string | undefined = $$('meta[property="article:modified_time"]').attr('content') ?? articleMetadata?.dateModified;

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
