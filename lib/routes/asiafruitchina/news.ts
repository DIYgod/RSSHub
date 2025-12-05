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
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://asiafruitchina.net';
    const targetUrl: string = new URL('category/news', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.listBlocks ul li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('div.storyDetails h3 a');

            const title: string = $aEl.text();
            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                images:
                    $el.find('a.image img').length > 0
                        ? $el
                              .find('a.image img')
                              .toArray()
                              .map((imgEl) => {
                                  const $imgEl: Cheerio<Element> = $(imgEl);

                                  return {
                                      src: $imgEl.attr('src'),
                                      alt: $imgEl.attr('alt'),
                                  };
                              })
                        : undefined,
            });
            const pubDateStr: string | undefined = $el.find('span.date').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const image: string | undefined = $el.find('a.image img').attr('src');
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

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('div.story_title h1').text();
                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.storytext').html(),
                    });
                    const pubDateStr: string | undefined = $$('span.date').first().text().split(/：/).pop();
                    const categories: string[] =
                        $$('meta[name="keywords"]')
                            .attr('content')
                            ?.split(/,/)
                            .map((c) => c.trim()) ?? [];
                    const authors: DataItem['author'] = $$('span.author').first().text();
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        category: categories,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    const extraLinkEls: Element[] = $$('div.extrasStory ul li').toArray();
                    const extraLinks = extraLinkEls
                        .map((extraLinkEl) => {
                            const $$extraLinkEl: Cheerio<Element> = $$(extraLinkEl);

                            return {
                                url: $$extraLinkEl.find('a').attr('href'),
                                type: 'related',
                                content_html: $$extraLinkEl.html(),
                            };
                        })
                        .filter((_): _ is { url: string; type: string; content_html: string } => true);

                    if (extraLinks) {
                        processedItem = {
                            ...processedItem,
                            _extra: {
                                links: extraLinks,
                            },
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

    const title: string = $('title').text().trim();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.logo').attr('src'),
        author: title.split(/-/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/news',
    name: '行业资讯',
    url: 'asiafruitchina.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/asiafruitchina/news',
    parameters: undefined,
    description: undefined,
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
            source: ['asiafruitchina.net/category/news'],
            target: '/asiafruitchina/news',
        },
    ],
    view: ViewType.Articles,
};
