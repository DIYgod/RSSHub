import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'https://blog.google';
const browserUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

export function extractGoogleCards(html: string, selector = 'article a[href]'): DataItem[] {
    const $ = load(html);

    return $(selector)
        .toArray()
        .map((element) => {
            const $element = $(element);
            const href = $element.attr('href');
            const text = $element.text().trim().replaceAll(/\s+/g, ' ');
            if (!href || !text || text.length < 20) {
                return null;
            }
            const link = new URL(href, baseUrl).href;
            const pathDepth = new URL(link).pathname.split('/').filter(Boolean).length;
            if (!link.startsWith(baseUrl) || !/\/[^/]+\/$/.test(link) || pathDepth < 4) {
                return null;
            }

            return {
                title: text.split(/(?<=[.!?])\s+/)[0],
                link,
            } satisfies DataItem;
        })
        .filter((item, index, items): item is DataItem => Boolean(item) && items.findIndex((other) => other?.link === item.link) === index)
        .slice(0, 20);
}

export async function fetchGoogleBlogCollection(targetUrl: string, selector?: string): Promise<DataItem[]> {
    const response = await fetch(targetUrl, {
        headers: {
            'user-agent': browserUa,
        },
    });
    const pageHtml = await response.text();
    const list = extractGoogleCards(pageHtml, selector);

    const item = await pMap(
        list,
        (entry) =>
            cache.tryGet(entry.link!, async () => {
                const detail = await fetch(entry.link!, {
                    headers: {
                        'user-agent': browserUa,
                    },
                });
                const detailHtml = await detail.text();
                const $ = load(detailHtml);
                const article = $('main article').first();

                article.find('nav, aside, [class*="share" i], [class*="social" i], [class*="breadcrumb" i]').remove();

                return {
                    title: article.find('h1').first().text().trim() || entry.title,
                    link: entry.link,
                    pubDate: parseDate($('meta[property="article:published_time"]').attr('content') ?? ''),
                    description: article.html() ?? undefined,
                    author: $('meta[name="author"]').attr('content') ?? 'Google',
                } satisfies DataItem;
            }),
        { concurrency: 5 }
    );

    if (item.length > 0) {
        return item;
    }

    const regexFallback = [...pageHtml.matchAll(/<a href="(https:\/\/blog\.google\/[^"]+\/)"[^>]*>([\s\S]*?)<\/a>/g)]
        .map((match) => {
            const link = match[1];
            const text = load(`<div>${match[2]}</div>`)('div').text().trim().replaceAll(/\s+/g, ' ');
            const pathDepth = new URL(link).pathname.split('/').filter(Boolean).length;
            if (!text || text.length < 20 || pathDepth < 4 || link === targetUrl) {
                return null;
            }

            return {
                title: text.split(/(?<=[.!?])\s+/)[0],
                link,
            } satisfies DataItem;
        })
        .filter((entry, index, entries): entry is DataItem => Boolean(entry) && entries.findIndex((other) => other?.link === entry.link) === index)
        .slice(0, 20);

    if (regexFallback.length > 0) {
        return pMap(
            regexFallback,
            (entry) =>
                cache.tryGet(entry.link!, async () => {
                    const detail = await fetch(entry.link!, {
                        headers: {
                            'user-agent': browserUa,
                        },
                    });
                    const detailHtml = await detail.text();
                    const $ = load(detailHtml);
                    const article = $('main article').first();

                    article.find('nav, aside, [class*="share" i], [class*="social" i], [class*="breadcrumb" i]').remove();

                    return {
                        title: article.find('h1').first().text().trim() || entry.title,
                        link: entry.link,
                        pubDate: parseDate($('meta[property="article:published_time"]').attr('content') ?? ''),
                        description: article.html() ?? undefined,
                        author: $('meta[name="author"]').attr('content') ?? 'Google',
                    } satisfies DataItem;
                }),
            { concurrency: 5 }
        );
    }

    const $ = load(pageHtml);
    const title = $('title').text().trim();

    return [
        {
            title,
            description: $('main').html() ?? pageHtml,
            link: targetUrl,
            guid: `google-blog-fallback-${targetUrl}`,
        },
    ];
}
