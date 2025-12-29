import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.thebrain.com';
    const targetUrl: string = new URL('blog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('div.blog-row')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h4 a');

            const title: string = $aEl.text();
            const image: string | undefined = $el.find('div.round-corner-images img').attr('src') ? `https:${$el.find('div.round-corner-images img').attr('src')?.split(/\?/)[0]}` : undefined;
            const description: string | undefined = renderToString(
                <>
                    {image ? (
                        <figure>
                            <img src={image} alt={title} />
                        </figure>
                    ) : null}
                    {$el.find('p.small-text').next().html() ? raw($el.find('p.small-text').next().html()) : null}
                </>
            );
            const pubDateStr: string | undefined = $el.find('p.small-text').text();
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

                const title: string = $$('h2.gradient-heading').text() || $$('h1.gradient-heading').text();

                $$('h2.gradient-heading').remove();
                $$('div#shareDiv').remove();

                const description: string | undefined = $$('div.blog-content').html() || $$('div.docs-section').html() || undefined;
                const pubDateStr: string | undefined = $$('div.blog-meta').text();
                const categoryEls: Element[] = $$('a.under-category').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                const authorEls: Element[] = $$('img.avatar').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl).parent().next().find('a');

                    return {
                        name: $$authorEl.text(),
                        url: $$authorEl.attr('href') ? new URL($$authorEl.attr('href') as string, baseUrl).href : undefined,
                        avatar: `https:${$$(authorEl).attr('src')?.split(/\?/)[0]}`,
                    };
                });
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
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.navbar-logo').attr('src') ? new URL($('img.navbar-logo').attr('src') as string, baseUrl).href : undefined,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'www.thebrain.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/thebrain/blog',
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
            source: ['www.thebrain.com/blog'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
};
