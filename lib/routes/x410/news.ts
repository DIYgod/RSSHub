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

    const baseUrl: string = 'https://x410.dev';
    const targetUrl: string = new URL('news', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('article.post')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h4 a');

            const title: string = $aEl.text();
            const description: string | undefined = renderDescription({
                description: $el.find('div#cookbook').html(),
            });
            const pubDateStr: string | undefined = $el.find('span.updated').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const image: string | undefined = $el
                .find('ul.slides li a img')
                .attr('src')
                ?.replace(/-\d+x\d+/, '');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
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

                $$('img').each((_, imgEl) => {
                    const $$imgEl: Cheerio<Element> = $$(imgEl);
                    const src: string | undefined = $$imgEl.attr('data-orig-src');

                    if (src && src.startsWith('/')) {
                        $$imgEl.attr('src', new URL(src, baseUrl).href);
                    }
                });

                const title: string = $$('.title').text();
                const description: string | undefined = renderDescription({
                    description: $$('div#cookbook').html(),
                });
                const pubDateStr: string | undefined = $$('meta[property="article:published_time"]').attr('content');
                const categoryEls: Element[] = $$('div.post-header-text-cat p a').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                const authorEls: Element[] = $$('meta[name="author"]').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.attr('content') || '',
                        url: undefined,
                        avatar: undefined,
                    };
                });
                const image: string | undefined = $$('meta[property="og:image"]').attr('content');
                const upDatedStr: string | undefined = $$('.time').text() || pubDateStr;

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
        image: $('meta[name="msapplication-TileImage"]').attr('content') ? new URL($('meta[name="msapplication-TileImage"]').attr('content') as string, baseUrl).href : undefined,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/news',
    name: 'News',
    url: 'x410.dev',
    maintainers: ['nczitzk'],
    handler,
    example: '/x410/news',
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
            source: ['x410.dev'],
            target: '/news',
        },
    ],
    view: ViewType.Articles,
};
