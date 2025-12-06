import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '5', 10);

    const baseUrl: string = 'https://aflcio.org';
    const targetUrl: string = new URL('blog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('article.article')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('header.container h1 a').first();

            const title: string = $aEl.text();
            const description: string | undefined = $el.find('div.section').html() ?? '';
            const pubDateStr: string | undefined = $el.find('div.date-timeline time').attr('datetime');
            const linkUrl: string | undefined = $aEl.attr('href');
            const authorEls: Element[] = $el.find('div.date-timeline a.user').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: $authorEl.attr('href') ? new URL($authorEl.attr('href') as string, baseUrl).href : undefined,
                    avatar: undefined,
                };
            });
            const image: string | undefined = $el.find('div.section img').first().attr('src') ? new URL($el.find('div.section img').first().attr('src') as string, baseUrl).href : undefined;
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
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

                    const title: string = $$('header.article-header h1').text();
                    const description: string | undefined = $$('div.section-article-body').html() ?? '';
                    const pubDateStr: string | undefined = $$('time').attr('datetime');
                    const authorEls: Element[] = $$('div.byline a[property="schema:name"]').toArray();
                    const authors: DataItem['author'] = authorEls.map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl);

                        return {
                            name: $$authorEl.text(),
                            url: $$authorEl.attr('href') ? new URL($$authorEl.attr('href') as string, baseUrl).href : undefined,
                            avatar: undefined,
                        };
                    });
                    const image: string | undefined = $$('meta[property="og:image"]').attr('content');
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
        )
    ).filter((_): _ is DataItem => true);

    const title: string = $('title').text();

    return {
        title,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.main-logo').attr('src') ? new URL($('img.main-logo').attr('src') as string, baseUrl).href : undefined,
        author: title.split(/\|/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'aflcio.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/aflcio/blog',
    parameters: undefined,
    description: undefined,
    categories: ['other'],
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
            source: ['aflcio.org/blog'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
};
