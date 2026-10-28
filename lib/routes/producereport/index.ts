import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'produce/fresh-fruits/apples' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 10);

    const baseUrl = 'https://www.producereport.com';
    const targetUrl = `${baseUrl}/${category}`;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('table.views-table tbody tr')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a').first();

            const title: string = $aEl.text();
            const image: string | undefined = $el
                .find('td.views-field-field-image a img')
                .attr('src')
                ?.replace(/styles\/thumbnail\/public/, '')
                ?.split(/\?/, 1)?.[0];

            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $aEl.parent().contents().last().text().trim(),
            });
            const pubDateStr: string | undefined = $el.find('td.views-field-created').contents().first().text()?.trim();
            const linkUrl: string | undefined = $aEl.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                    text: description ? load(description).text() : undefined,
                },
                image,
                banner: image,
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        async (item) => {
            if (!item.link) {
                return item;
            }

            const detail = await cache.tryGet(`producereport:article:v2:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title = $$('meta[property="og:title"]').attr('content');
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');

                const description = $$('div[property="content:encoded"]').html() ?? undefined;
                const pubDateStr: string | undefined = $$('div.pane-node-created').text()?.trim();
                const categoryEls: Element[] = $$('div.pane-node-field-topics a').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                const authorEls: Element[] = $$('div.pane-node-author a.username').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);
                    const authorHref: string | undefined = $$authorEl.attr('href');

                    return {
                        name: $$authorEl.text(),
                        url: authorHref ? new URL(authorHref, baseUrl).href : undefined,
                        avatar: undefined,
                    };
                });

                return {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                    category: categories,
                    author: authors,
                    image,
                };
            });
            const title = detail.title ?? item.title;
            const description = renderDescription({
                images: detail.image ? [{ src: detail.image, alt: title }] : undefined,
                description: detail.description,
            });
            return {
                ...item,
                ...detail,
                title,
                description,
                pubDate: detail.pubDate ?? item.pubDate,
                content: { html: description, text: load(description).text() },
                banner: detail.image,
                language,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:title"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: 'Category',
    url: 'www.producereport.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/producereport/produce/fresh-fruits/apples',
    parameters: {
        category: {
            description: 'Category, `Fresh Fruits - Apple` by default',
        },
    },
    description: `::: tip
To subscribe to [Apples](https://www.producereport.com/produce/fresh-fruits/apples), where the source URL is \`https://www.producereport.com/produce/fresh-fruits/apples\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/producereport/produce/fresh-fruits/apples\`](https://rsshub.app/producereport/produce/fresh-fruits/apples).
:::`,
    categories: ['new-media'],
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
            source: ['www.producereport.com/*category'],
            target: '/:category',
        },
    ],
    view: ViewType.Articles,
};
