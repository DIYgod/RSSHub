import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

const __dirname = getCurrentPath(import.meta.url);

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.landiannews.com';
    const targetUrl: string = baseUrl;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('section.article-list a.title')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const processedItem: DataItem = {
                title: $el.attr('title') ?? $el.text(),
                link: $el.attr('href'),
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

                    const title: string = $$('header.post-header h1').text();
                    const intro: string = $$('div.excerpt').text();

                    $$('div.excerpt').remove();

                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        intro,
                        description: $$('div.content-post').html(),
                    });
                    const pubDateStr: string | undefined = $$('span.date').text();
                    const categoryEls: Element[] = $$('span.category a, div.article-tags a').toArray();
                    const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).attr('title') ?? $$(el).text()).filter(Boolean))];
                    const authorEls: Element[] = $$('span.author a[title]').toArray();
                    const authors: DataItem['author'] = authorEls.map((authorEl) => {
                        const $$authorEl: Cheerio<Element> = $$(authorEl);

                        return {
                            name: $$authorEl.attr('title') ?? '',
                            url: $$authorEl.attr('href') ?? '',
                            avatar: $$authorEl.find('img.avatar').attr('src'),
                        };
                    });
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr, 'YYYY年M月D日 HH:mm'), +8) : item.pubDate,
                        category: categories,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? timezone(parseDate(upDatedStr, 'YYYY年M月D日 HH:mm'), +8) : item.updated,
                        language,
                    };

                    const extraLinkEls: Element[] = $$('section.article-list a[title]').toArray();
                    const extraLinks = extraLinkEls
                        .map((extraLinkEl) => {
                            const $$extraLinkEl: Cheerio<Element> = $$(extraLinkEl);

                            return {
                                url: $$extraLinkEl.attr('href'),
                                type: 'related',
                                content_html: $$extraLinkEl.text(),
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

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.logo').attr('src'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/',
    name: '资讯',
    url: 'www.landiannews.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/landiannews',
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
            source: ['www.landiannews.com'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
