import path from 'node:path';

import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'produce/fresh-fruits/apples' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl: string = 'https://www.producereport.com';
    const targetUrl: string = new URL(category, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('table.views-table tbody tr')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a').first();

            const title: string = $aEl.text();
            const image: string | undefined = $el
                .find('td.views-field-field-image a img')
                .attr('src')
                ?.replace(/styles\/thumbnail\/public/, '')
                ?.split(/\?/)?.[0];

            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
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
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                    text: description,
                },
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

                const title: string = $$('meta[property="og:title"]').attr('content') ?? item.title;
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');

                const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: $$('div[property="content:encoded"]').html(),
                });
                const pubDateStr: string | undefined = $$('div.pane-node-created').text()?.trim();
                const categoryEls: Element[] = $$('div.pane-node-field-topics a').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                const authorEls: Element[] = $$('div.pane-node-author a.username').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.text(),
                        url: $$authorEl.attr('href') ? new URL($$authorEl.attr('href') as string, baseUrl).href : undefined,
                        avatar: undefined,
                    };
                });
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    category: categories,
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

    return {
        title: $('title').text(),
        description: $('meta[property="og:title"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
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
    description: `:::tip
To subscribe to [Apples](https://www.producereport.com/produce/fresh-fruits/apples), where the source URL is \`https://www.producereport.com/produce/fresh-fruits/apples\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/producereport/produce/fresh-fruits/apples\`](https://rsshub.app/producereport/produce/fresh-fruits/apples).
:::
`,
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
            source: ['www.producereport.com/:category'],
            target: '/:category',
        },
    ],
    view: ViewType.Articles,
};
