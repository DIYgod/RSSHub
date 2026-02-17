import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const BASE_URL = 'https://www.dailypush.dev';

export interface ArticleItem {
    title: string;
    link: string;
    author: DataItem['author'];
    pubDate?: Date;
    category?: string[];
    description?: string;
    articleUrl: string;
    dailyPushUrl?: string;
}

/**
 * Try to parse text as a date. Returns the Date if parsing succeeds and is valid, undefined otherwise.
 */
function tryParseAsDate(text: string): Date | undefined {
    try {
        const date = parseRelativeDate(text);
        return Number.isNaN(date.getTime()) ? undefined : date;
    } catch {
        return undefined;
    }
}

/**
 * Extract author from article element
 */
function extractAuthor(article: ReturnType<CheerioAPI>): DataItem['author'] {
    const container = article.find('.flex.items-center.gap-3').first();
    if (container.length === 0) {
        return undefined;
    }

    // Get all content spans (exclude separator spans with '•')
    const allSpans = container.find('span');
    const contentSpans: string[] = [];

    for (let i = 0; i < allSpans.length; i++) {
        const $span = allSpans.eq(i);
        const text = $span.text().trim();
        // Skip separator spans (contain only '•' or have separator classes)
        if (text !== '•' && !$span.hasClass('text-slate-300') && !$span.hasClass('dark:text-slate-600')) {
            contentSpans.push(text);
        }
    }

    // Handle different cases based on number of content spans
    switch (contentSpans.length) {
        case 3:
            // Structure: author, date, reading time
            if (contentSpans[0].includes(',')) {
                const authors: DataItem['author'] = contentSpans[0].split(',').map((author) => ({
                    name: author.trim(),
                }));
                return authors;
            }
            return contentSpans[0];
        case 2: {
            // Two cases:
            // 1. date, reading time (no author)
            // 2. author, date (no reading time)
            const firstText = contentSpans[0];
            if (tryParseAsDate(firstText)) {
                // First is date, so no author
                break;
            }
            // First is author
            return firstText;
        }
        case 1: {
            // Could be date or author
            const text = contentSpans[0];
            if (tryParseAsDate(text)) {
                return undefined;
            }
            return text;
        }
        default:
            break;
    }

    // Fallback: use the post source as author
    const sourceSpan = article.find('span.text-xs.font-medium.uppercase').first();
    if (sourceSpan.length > 0) {
        return sourceSpan.text().trim();
    }

    return undefined;
}

/**
 * Extract categories/tags from article element
 */
function extractCategories(article: ReturnType<CheerioAPI>, $: CheerioAPI): string[] {
    return article
        .find('a[href^="/"]')
        .toArray()
        .map((tagEl) => {
            const tagElement = $(tagEl);
            const tagHref = tagElement.attr('href');
            const tagText = tagElement.text().trim();

            // Skip summary/stats links and navigation
            if (tagHref && tagText && !tagHref.includes('article/') && !tagHref.includes('Summary') && tagText.length < 50 && !/^(Summary|stats|About|Tags|Toggle|Trending|Latest|Previous|Next)$/i.test(tagText)) {
                return tagText;
            }
            return null;
        })
        .filter((tagText): tagText is string => tagText !== null);
}

/**
 * Extract publication date from article element
 */
function extractPubDate(article: ReturnType<CheerioAPI>): Date | undefined {
    const container = article.find('.flex.items-center.gap-3').first();
    if (container.length === 0) {
        return undefined;
    }

    // Get all content spans (exclude separator spans with '•')
    const allSpans = container.find('span');
    const contentSpans: string[] = [];

    for (let i = 0; i < allSpans.length; i++) {
        const $span = allSpans.eq(i);
        const text = $span.text().trim();
        // Skip separator spans (contain only '•' or have separator classes)
        if (text !== '•' && !$span.hasClass('text-slate-300') && !$span.hasClass('dark:text-slate-600')) {
            contentSpans.push(text);
        }
    }

    let dateText: string | undefined;

    // Handle different cases based on number of content spans
    switch (contentSpans.length) {
        case 3:
            // Structure: author, date, reading time
            dateText = contentSpans[1];
            break;
        case 2: {
            // Two cases:
            // 1. date, reading time (no author)
            // 2. author, date (no reading time)
            const firstText = contentSpans[0];
            dateText = tryParseAsDate(firstText) ? firstText : contentSpans[1];
            break;
        }
        case 1: {
            // Could be date or author
            const text = contentSpans[0];
            if (tryParseAsDate(text)) {
                dateText = text;
            }
            break;
        }
        default:
            break;
    }

    return dateText ? tryParseAsDate(dateText) : undefined;
}

/**
 * Parse a single article element into an ArticleItem
 */
function parseArticle(article: ReturnType<CheerioAPI>, $: CheerioAPI, baseUrl: string): (DataItem & ArticleItem) | null {
    // Find the title link in h2 > a
    const titleLink = article.find('h2 a[href^="http"]').first();
    if (titleLink.length === 0) {
        return null;
    }

    const title = titleLink.text().trim();
    const link = titleLink.attr('href');

    if (!title || !link || link.includes('dailypush.dev')) {
        return null;
    }

    const author = extractAuthor(article);
    const description = article.find('p.text-sm.text-muted-foreground').first().text().trim() || undefined;
    const categories = extractCategories(article, $);

    const footer = article.find('.flex.items-center.justify-between.gap-4.flex-wrap').first();
    const summaryLink = footer.find('a[href*="/article/"]').first().attr('href');
    const dailyPushUrl = summaryLink ? `${baseUrl}${summaryLink}` : undefined;

    const pubDate = extractPubDate(article);

    return {
        title,
        link,
        author,
        pubDate,
        category: categories.length > 0 ? categories : undefined,
        description,
        articleUrl: link,
        dailyPushUrl,
        language: 'en',
    };
}

/**
 * Parse all articles from the page
 */
export function parseArticles($: CheerioAPI, baseUrl: string): ArticleItem[] {
    return $('article')
        .toArray()
        .map((articleEl) => {
            const article = $(articleEl);
            return parseArticle(article, $, baseUrl);
        })
        .filter((parsed): parsed is ArticleItem => parsed !== null);
}

/**
 * Enhance items with full summaries from dailypush article pages
 */
export async function enhanceItemsWithSummaries(items: ArticleItem[]): Promise<DataItem[]> {
    const itemsWithUrl = items.filter((item) => item.dailyPushUrl !== undefined);
    const itemsWithoutUrl: DataItem[] = items.filter((item) => item.dailyPushUrl === undefined);

    const enhancedItems: DataItem[] = await Promise.all(
        itemsWithUrl.map((item) =>
            cache.tryGet(item.dailyPushUrl!, async () => {
                // If we have a dailypush article URL, fetch it for the longer summary
                try {
                    const articleResponse = await ofetch(item.dailyPushUrl!);
                    const $ = load(articleResponse);

                    // Find the longer summary/description on the article page
                    const summary = $('p.font-ibm-plex-sans.leading-relaxed').first();

                    if (summary.length > 0 && summary.text().trim()) {
                        item.description = summary.text().trim();
                    }
                } catch {
                    // If fetching article page fails, keep the original description
                }

                return item;
            })
        )
    );

    // Include items without dailyPushUrl as-is
    return [...enhancedItems, ...itemsWithoutUrl];
}
