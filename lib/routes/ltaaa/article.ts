import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 30);

    const baseUrl = 'https://www.ltaaa.cn';
    const targetUrl: string = new URL('article', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;

    let items: DataItem[] = $('ul.wlist li')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const $aEl: Cheerio<Element> = $el.find('div.li-title a');

            const title: string = $aEl.text();
            const description: string = renderDescription({
                intro: $el.find('div.dbody p').text(),
            });
            const pubDateStr: string | undefined = $el.find('i.icon-time').next().text().trim();
            const linkUrl: string | undefined = $aEl.attr('href');
            const authorEls: Element[] = $el.find('i.icon-user').parent().find('a').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: new URL($authorEl.attr('href') ?? '', baseUrl).href,
                    avatar: undefined,
                };
            });
            const image: string | undefined = $el.find('div.li-thumb img').attr('src');

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDateInTimezone(pubDateStr, 8) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
                content: {
                    html: description,
                    text: $el.find('div.dbody p').text(),
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

            const detail = await cache.tryGet('ltaaa:article:' + item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('div.post-title').text();

                const pubDateStr: string | undefined = $$('i.icon-time').next().text().trim();
                const categoryEls: Element[] = $$('span.keywords a').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                const authorEls: Element[] = $$('i.icon-user').first().nextAll('a').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.text(),
                        url: new URL($$authorEl.attr('href') ?? '', baseUrl).href,
                        avatar: undefined,
                    };
                });

                $$('div.post-tip').each((_, el) => {
                    const $$el: Cheerio<Element> = $$(el);
                    const content: string = $$el.html() ?? '';

                    if (content) {
                        $$el.replaceWith(`<h1>${content}</h1>`);
                    }
                });
                $$('div.post-param, div.post-title, div.post-keywords').remove();
                $$('div.attitude, div.clear').remove();

                const description: string = renderDescription({
                    description: $$('div.post-body').html() ?? undefined,
                });

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDateInTimezone(pubDateStr, 8) : undefined,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: $$('div.post-body').text(),
                    },
                    language,
                };

                return processedItem;
            });
            return {
                ...item,
                ...detail,
                pubDate: detail.pubDate ?? item.pubDate,
            };
        },
        { concurrency: 3 }
    );

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: new URL('static/home/images/logo.png', baseUrl).href,
        author: title.split(/-/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/article',
    name: '网站翻译',
    url: 'www.ltaaa.cn',
    maintainers: ['sgqy', 'nczitzk'],
    handler,
    example: '/ltaaa/article',
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
            source: ['www.ltaaa.cn/article'],
            target: '/article',
        },
    ],
    view: ViewType.Articles,
};
