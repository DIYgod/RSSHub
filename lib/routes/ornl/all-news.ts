import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl = 'https://www.ornl.gov';
    const targetUrl: string = new URL('all-news', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = $('div.view-rows-main div.list-item-wrapper')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('div.list-item-title h2 a');
            const $imgEl: Cheerio<Element> = $el.find('div.list-item-thumbnail-wrapper img');

            const title: string = $aEl.text();
            const image: string | undefined = $imgEl.attr('src');
            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: $imgEl.attr('alt') || title,
                              width: Number($imgEl.attr('width')) || undefined,
                              height: Number($imgEl.attr('height')) || undefined,
                          },
                      ]
                    : undefined,
                intro: $el.find('div.list-item-desc p').text(),
            });
            const pubDateStr: string | undefined = $el.find('div.list-item-date').attr('datetime');
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
                const $$imgEl: Cheerio<Element> = $$('div.image-landscape img');

                const title: string = $$('h1.page-title').text();
                const image: string | undefined = $$imgEl.attr('src');
                const description: string | undefined = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: $$imgEl.attr('alt') || title,
                                  width: Number($$imgEl.attr('width')) || undefined,
                                  height: Number($$imgEl.attr('height')) || undefined,
                              },
                          ]
                        : undefined,
                    description: $$('div.image-description').html(),
                });
                const pubDateStr: string | undefined = $$('div.publish-date time').attr('datetime');
                const authorEls: Element[] = $$('div.related-researcher-container').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl).find('div.related-researcher-name a');

                    return {
                        name: $$authorEl.text(),
                        url: $$authorEl.attr('href') ? new URL($$authorEl.attr('href') as string, baseUrl).href : undefined,
                        avatar: $$authorEl.find('div.related-researcher-photo img').attr('src') ? new URL($$authorEl.find('div.related-researcher-photo img').attr('src') as string, baseUrl).href : undefined,
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

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[name="twitter:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/all-news',
    name: 'All News',
    url: 'www.ornl.gov',
    maintainers: ['nczitzk'],
    handler,
    example: '/ornl/all-news',
    parameters: undefined,
    description: undefined,
    categories: ['government'],
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
            source: ['www.ornl.gov/all-news'],
            target: '/all-news',
        },
    ],
    view: ViewType.Articles,
};
