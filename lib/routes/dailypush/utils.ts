import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const BASE_URL = 'https://www.dailypush.dev';

export interface ArticleItem {
    title: string;
    link: string;
    author?: string;
    pubDate?: Date;
    category?: string[];
    description?: string;
    articleUrl: string;
    dailyPushUrl?: string;
}

/**
 * Extract author from article element
 */
function extractAuthor(article: ReturnType<CheerioAPI>): string | undefined {
    const sourceSpan = article.find('span.text-xs.font-medium.uppercase').first();
    if (sourceSpan.length > 0) {
        return sourceSpan.text().trim();
    }

    // Fallback: look for author name in the date section
    const authorDateText = article.find('.flex.items-center.gap-3').first().text();
    const authorMatch = authorDateText.match(/^([^•]+?)(?:\s*•)/);
    if (authorMatch && !/\d{4}/.test(authorMatch[1])) {
        return authorMatch[1].trim();
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
    const footer = article.find('.flex.items-center.justify-between.gap-4.flex-wrap').first();
    const authorAndDate = footer.find('.flex.items-center.gap-3.text-xs').first();

    if (authorAndDate.length === 0) {
        return undefined;
    }

    const spans = authorAndDate.find('span');
    let dateText: string | undefined;

    if (spans.length === 3) {
        // Has author: date is in the third span (index 2)
        // Structure: <span>Author</span><span>•</span><span>Date</span>
        dateText = spans.eq(2).text().trim();
    } else if (spans.length === 1) {
        // No author: date is in the first span (index 0)
        // Structure: <span>Date</span>
        dateText = spans.eq(0).text().trim();
    }

    if (!dateText) {
        return undefined;
    }

    try {
        return parseDate(dateText);
    } catch {
        // If parsing fails, try fallback patterns
        const datePattern = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+,\s+\d{4})/i;
        const match = dateText.match(datePattern);
        if (match && match[1]) {
            try {
                return parseDate(match[1]);
            } catch {
                // If parsing fails, keep undefined
            }
        }
    }

    return undefined;
}

/**
 * Parse a single article element into an ArticleItem
 */
function parseArticle(article: ReturnType<CheerioAPI>, $: CheerioAPI, baseUrl: string): ArticleItem | null {
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
        author: author || undefined,
        pubDate,
        category: categories.length > 0 ? categories : undefined,
        description,
        articleUrl: link,
        dailyPushUrl,
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
    const itemsWithoutUrl = items.filter((item) => item.dailyPushUrl === undefined);

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
