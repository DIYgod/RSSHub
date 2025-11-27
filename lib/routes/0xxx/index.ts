import path from 'node:path';

import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx: Context): Promise<Data> => {
    const { filter } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const baseUrl: string = 'https://0xxx.ws';
    const targetUrl: string = new URL(filter ? `?${filter}` : '', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('table#home-table tr:not(.gore)')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const $categoryEl: Cheerio<Element> = $el.find('td.category');
            const $catalogueEl: Cheerio<Element> = $el.find('td.catalogue');
            const $dateEl: Cheerio<Element> = $el.find('td.date');

            const title: string = $el.find('td.title').text();
            const image: string | undefined = $el.find('a.screenshot').attr('rel');

            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                category: $categoryEl.html(),
                catalogue: $catalogueEl.html(),
                title,
                size: $el.find('td.size').text(),
                date: $dateEl.html(),
            });
            const pubDateStr: string | undefined = $dateEl.text();
            const linkUrl: string | undefined = $el.find('td.title a').attr('href');
            const categories: string[] = [...new Set([$categoryEl.text()?.trim(), $catalogueEl.text()?.trim(), $dateEl.text()])].filter((c): c is string => Boolean(c && c !== '-'));
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr, 'DD.MM.YYYY') : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr, 'DD.MM.YYYY') : undefined,
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

                const description: string | undefined =
                    art(path.join(__dirname, 'templates/description.art'), {
                        images: $$('div.thumbs img')
                            .toArray()
                            .map((i) => {
                                const $i: Cheerio<Element> = $$(i);

                                return {
                                    src: $i.attr('src'),
                                    alt: $i.attr('alt') ?? item.title,
                                };
                            }),
                    }) + (item.description ?? '');

                return {
                    ...item,

                    description,
                };
            });
        })
    );

    const title: string | undefined = $('title').text()?.split(/\|/).pop();

    return {
        title: title ? `${title} - ${filter}` : filter,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.logo img').attr('src') ? new URL($('div.logo img').attr('src') as string, baseUrl).href : undefined,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:filter?',
    name: 'Source',
    url: '0xxx.ws',
    maintainers: ['nczitzk'],
    handler,
    example: '/0xxx/category=Movie-HD-1080p',
    parameters: {
        filter: {
            description: 'Filter',
        },
    },
    description: `:::tip
To subscribe to [Movie HD 1080p](https://0xxx.ws?category=Movie-HD-1080p), where the source URL is \`https://0xxx.ws?category=Movie-HD-1080p\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/0xxx/category=Movie-HD-1080p\`](https://rsshub.app/0xxx/category=Movie-HD-1080p).
:::
`,
    categories: ['multimedia'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nfsw: true,
    },
    radar: [
        {
            source: ['0xxx.ws'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const params = urlObj.searchParams;

                params.delete('next');

                const filter: string = urlObj.searchParams.toString();

                return `/0xxx${filter ? `/${filter}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
