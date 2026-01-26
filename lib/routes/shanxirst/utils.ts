import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const rootUrl = 'https://rst.shanxi.gov.cn';

const range = 'bytes=0-800000';

export function resolveUrl(url: string | undefined, base: string): string | undefined {
    if (!url) {
        return;
    }

    try {
        return new URL(url, base).href;
    } catch {
        return url;
    }
}

export function makeLinksAbsolute($: CheerioAPI, element: Cheerio<Element>, base: string) {
    element.find('a[href]').each((_, a) => {
        const href = $(a).attr('href');
        const resolvedHref = resolveUrl(href, base);
        if (resolvedHref) {
            $(a).attr('href', resolvedHref);
        }
    });

    element.find('img[src]').each((_, img) => {
        const src = $(img).attr('src');
        const resolvedSrc = resolveUrl(src, base);
        if (resolvedSrc) {
            $(img).attr('src', resolvedSrc);
        }
    });
}

export async function fetchHtml(url: string, referer?: string): Promise<string> {
    const headers: Record<string, string> = {
        'User-Agent': config.ua,
        Range: range,
    };
    if (referer) {
        headers.Referer = referer;
    }

    const { data: response } = await got(url, {
        headers,
        timeout: config.requestTimeout,
    });

    return response;
}

export function parseListDate(dateText: string | undefined): Date | undefined {
    const text = dateText?.trim();
    if (!text) {
        return;
    }

    return timezone(parseDate(text, 'YYYY.MM.DD'), +8);
}

export function parseDetailDate(infoText: string): Date | undefined {
    const match = /日期[:：]\\s*(\\d{4}-\\d{2}-\\d{2}(?:\\s+\\d{2}:\\d{2}:\\d{2})?)/.exec(infoText);
    const dateText = match?.[1]?.trim();
    if (!dateText) {
        return;
    }

    if (dateText.includes(':')) {
        return timezone(parseDate(dateText, 'YYYY-MM-DD HH:mm:ss'), +8);
    }

    return timezone(parseDate(dateText, 'YYYY-MM-DD'), +8);
}

export function parseSource(infoText: string): string | undefined {
    const match = /信息来源[:：]\\s*([^\\s]+)/.exec(infoText);
    const source = match?.[1]?.trim();
    return source || undefined;
}

export function parseDetailTitle($: CheerioAPI): string | undefined {
    const titleCandidates = $('.j-fontContent p[align=\"center\"] span')
        .toArray()
        .map((span) => $(span).text().trim())
        .filter(Boolean);

    return titleCandidates[0] || undefined;
}

export function extractContent($: CheerioAPI): Cheerio<Element> | undefined {
    const contentSelectors = ['.trs_editor_view', '.TRS_Editor', '#zoom', '#Zoom'];
    for (const selector of contentSelectors) {
        const content = $(selector).first();
        if (content.length) {
            return content;
        }
    }

    return;
}

export async function fetchItem(item: DataItem, referer: string): Promise<DataItem> {
    if (!item.link || !item.link.startsWith(rootUrl)) {
        return item;
    }

    return cache.tryGet(item.link, async () => {
        try {
            const response = await fetchHtml(item.link as string, referer);
            const $ = load(response);

            const title = parseDetailTitle($);
            if (title) {
                item.title = title;
            }

            const infoText = $('.newsinfo').first().text().replaceAll(/\\s+/g, ' ').trim();
            if (infoText) {
                item.pubDate = parseDetailDate(infoText) || item.pubDate;
                item.author = parseSource(infoText) || item.author;
            }

            const content = extractContent($);
            if (content) {
                content.find('script').remove();
                content.find('style').remove();
                makeLinksAbsolute($, content, item.link as string);
                item.description = content.html() ?? item.description;
            }

            return item;
        } catch {
            return item;
        }
    });
}

