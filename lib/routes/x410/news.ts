import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const baseUrl = 'https://x410.dev';
function getDate(value?: string) {
    const date = value ? parseDate(value) : undefined;
    return date && Number.isFinite(date.getTime()) ? date : undefined;
}
async function fetchDetail(link: string) {
    const detailResponse = await ofetch(link);
    const $$: CheerioAPI = load(detailResponse);
    $$('img').each((_, imgEl) => {
        const $$imgEl: Cheerio<Element> = $$(imgEl);
        const src: string | undefined = $$imgEl.attr('data-orig-src');
        if (src && src.startsWith('/')) {
            $$imgEl.attr('src', new URL(src, baseUrl).href);
        }
    });
    const description: string | undefined = renderDescription({
        description: $$('div#cookbook, div#news').first().html() ?? undefined,
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
    const updatedStr = $$('meta[property="article:modified_time"]').attr('content');
    const processedItem: Pick<DataItem, 'description' | 'pubDate' | 'category' | 'author' | 'content' | 'image' | 'banner' | 'updated'> = {
        description,
        pubDate: getDate(pubDateStr),
        category: categories,
        author: authors,
        content: {
            html: description,
            text: $$('div#cookbook, div#news').first().prop('innerText'),
        },
        image,
        banner: image,
        updated: getDate(updatedStr),
    };
    return processedItem;
}
export const handler = async (ctx: Context): Promise<Data> => {
    const requestedLimit = Number(ctx.req.query('limit') ?? '30');
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 30;
    const targetUrl: string = new URL('news', baseUrl).href;
    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;
    let items: DataItem[] = $('article.post')
        .slice(0, limit)
        .toArray()
        .filter((el) => $(el).find('h4 a').attr('href'))
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h4 a');
            const title: string = $aEl.text();
            const description: string | undefined = renderDescription({
                description: $el.find('div#cookbook').html() ?? undefined,
            });
            const updatedStr = $el.find('span.updated').first().text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const image: string | undefined = $el
                .find('ul.slides li a img')
                .attr('src')
                ?.replace(/-\d+x\d+/, '');
            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl ? new URL(linkUrl, targetUrl).href : undefined,
                content: {
                    html: description,
                    text: $el.find('div#cookbook').prop('innerText'),
                },
                image,
                banner: image,
                updated: getDate(updatedStr),
                language,
            };
            return processedItem;
        });
    items = await pMap(
        items,
        (item) => {
            if (!item.link) {
                return item;
            }
            return mapResolvedValue(
                cache.tryGet(`x410:news:detail:v5:${item.link}`, () => fetchDetail(item.link!)),
                (detail) => ({
                    ...item,
                    description: detail.description,
                    pubDate: detail.pubDate,
                    category: detail.category,
                    author: detail.author,
                    content: detail.content,
                    image: detail.image,
                    banner: detail.banner,
                    updated: detail.updated ?? item.updated,
                })
            );
        },
        { concurrency: 3, stopOnError: false }
    );
    const tileImage: string | undefined = $('meta[name="msapplication-TileImage"]').attr('content');
    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: tileImage ? new URL(tileImage, baseUrl).href : undefined,
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
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
