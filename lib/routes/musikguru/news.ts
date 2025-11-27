import path from 'node:path';

import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl: string = 'https://musikguru.de';
    const targetUrl: string = new URL('news/', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'de';

    let items: DataItem[] = [];

    items = $('section')
        .eq(1)
        .find('div.card')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('h5.card-title').text();
            const image: string | undefined = $el.find('img').attr('src');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $el.find('p.card-text').text(),
            });
            const linkUrl: string | undefined = $el.find('a').first().attr('href');

            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
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

                const title: string = $$('div.article h1').text();
                const description: string | undefined =
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        description: ($$('p.lead').html() ?? '') + ($$('div.lead').html() ?? ''),
                    });
                const pubDateStr: string | undefined = $$('div.article div.text-muted').text().split(/\sUhr/)?.[0];
                const image: string | undefined = $$('div.article img').first().attr('src');
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr, 'DD.MM.YYYY HH:mm'), +1) : item.pubDate,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? timezone(parseDate(upDatedStr, 'DD.MM.YYYY HH:mm'), +1) : item.updated,
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
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.navbar-brand img').attr('src') ? new URL($('a.navbar-brand img').attr('src') as string, baseUrl).href : undefined,
        author: $('a.navbar-brand img').attr('alt'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/news',
    name: 'News',
    url: 'musikguru.de',
    maintainers: ['nczitzk'],
    handler,
    example: '/musikguru/news',
    parameters: undefined,
    description: undefined,
    categories: ['multimedia'],
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
            source: ['musikguru.de/news'],
            target: 'news',
        },
    ],
    view: ViewType.Articles,
};
