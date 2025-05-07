import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '12', 10);

    const baseUrl: string = 'https://magazine.raspberrypi.com';
    const targetUrl: string = new URL('issues', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    const author: DataItem['author'] = $('meta[property="og:site_name"]').attr('content');

    items = $('div.o-grid--equal div.o-grid__col')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h2.rspec-issue-card-heading a.c-link');

            const title: string = $aEl.text()?.trim();
            const image: string | undefined = $el.find('div.o-media__fixed a.c-link img').attr('src');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $el.find('p.rspec-issue-card-summary').text(),
            });
            const pubDateStr: string | undefined = $el.find('time').attr('datetime');
            const linkUrl: string | undefined = $aEl.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author,
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

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('h1.rspec-issue__heading').text().split(/-/).pop()?.trim() ?? item.title;
                    const description: string | undefined =
                        item.description +
                        art(path.join(__dirname, 'templates/description.art'), {
                            description: $$('div.rspec-issue__description').html(),
                        });
                    const pubDateStr: string | undefined = $$('time.rspec-issue__publication-month').attr('datetime');
                    const image: string | undefined = $$('img.c-figure__image').attr('src');
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        author,
                        content: {
                            html: description,
                            text: description,
                        },
                        image,
                        banner: image,
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    const pdfUrl: string = new URL('pdf/download', `${item.link}/`).href;
                    const pdfResponse = await ofetch(pdfUrl);
                    const $$$: CheerioAPI = load(pdfResponse);

                    const $$$enclosureEl: Cheerio<Element> = $$$('a.c-link').first();
                    const enclosureUrl: string | undefined = $$$enclosureEl.attr('href') ? new URL($$$enclosureEl.attr('href') as string, baseUrl).href : undefined;

                    if (enclosureUrl) {
                        const enclosureType: string = 'application/pdf';

                        processedItem = {
                            ...processedItem,
                            enclosure_url: enclosureUrl,
                            enclosure_type: enclosureType,
                            enclosure_title: title,
                            enclosure_length: undefined,
                        };
                    }

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
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
    path: '/magazine',
    name: 'Official Magazine',
    url: 'magazine.raspberrypi.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/raspberrypi/magazine',
    parameters: undefined,
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
            source: ['magazine.raspberrypi.com'],
            target: '/raspberrypi/magazine',
        },
    ],
    view: ViewType.Articles,
};
