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
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://rockthejvm.com';
    const targetUrl: string = new URL('articles/1', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    $('footer').remove();

    let items: DataItem[] = [];

    items = $('h2')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el).parent().parent();
            const $aEl: Cheerio<Element> = $el.find('h2 a');

            const title: string = $aEl.text();
            const description: string | undefined = renderDescription({
                intro: $el.find('p.text-content').first().text(),
            });
            const pubDateStr: string | undefined = $el.find('time').attr('datetime');
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('a.bg-tag').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const authorEls: Element[] = $el.find('picture').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl).parent();

                return {
                    name: $authorEl.find('p.text-content').text(),
                    url: $authorEl.find('p.text-content a').attr('href') ? new URL($authorEl.find('p.text-content a').attr('href') as string, baseUrl).href : undefined,
                    avatar: $authorEl.find('img').attr('src') ? new URL($authorEl.find('img').attr('src') as string, baseUrl).href : undefined,
                };
            });
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
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
                const description: string | undefined =
                    item.description +
                    renderDescription({
                        description: $$('div.prose').html() ?? undefined,
                    });
                const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                const categoryEls: Element[] = $$('meta[property="article:tag"]').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).attr('content')).filter(Boolean))];
                const authorEls: Element[] = $$('meta[property="article:author"]').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.attr('content'),
                        url: undefined,
                        avatar: undefined,
                    };
                });
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');
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
    path: '/articles',
    name: 'Article',
    url: 'rockthejvm.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/rockthejvm/articles',
    parameters: undefined,
    description: undefined,
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
            source: ['rockthejvm.com/articles'],
            target: '/articles',
        },
    ],
    view: ViewType.Articles,
};
