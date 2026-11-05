import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
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

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 10);

    const baseUrl = 'https://musikguru.de';
    const targetUrl: string = new URL('news/', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'de') as Language;

    let items: DataItem[] = $('section')
        .eq(1)
        .find('div.card')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('h5.card-title').text();
            const image: string | undefined = $el.find('img').attr('src');
            const description: string | undefined = renderDescription({
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
                    text: $el.find('p.card-text').text(),
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

            const details = await cache.tryGet(`musikguru:details-v2:${item.link}`, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('div.article h1').text();
                const leadHtml = ($$('p.lead').html() ?? '') + ($$('div.lead').html() ?? '');
                const description: string | undefined = renderDescription({ description: leadHtml || undefined });
                const pubDateStr: string | undefined = $$('div.article div.text-muted').text().split(/\sUhr/, 1)?.[0];
                const image: string | undefined = $$('div.article img').first().attr('src');

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(dayjs.tz(pubDateStr, 'DD.MM.YYYY HH:mm', 'Europe/Berlin').format()) : item.pubDate,
                    content: {
                        html: description,
                        text: $$('p.lead, div.lead').text(),
                    },
                    image,
                    banner: image,
                    language,
                };

                return processedItem;
            });
            delete details.updated;
            const description = `${item.description ?? ''}${details.description ?? ''}`;
            return { ...item, ...details, description, content: { html: description, text: load(description).text() } };
        },
        { concurrency: 3 }
    );

    const logoSrc: string | undefined = $('a.navbar-brand img').attr('src');

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: logoSrc ? new URL(logoSrc, baseUrl).href : undefined,
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
            target: '/news',
        },
    ],
    view: ViewType.Articles,
};
