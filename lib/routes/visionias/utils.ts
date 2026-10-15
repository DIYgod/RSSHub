import type { Cheerio } from 'cheerio';
import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';
import { renderDescriptionSub } from './templates/description-sub';

export const baseUrl = 'https://visionias.in';

type ArticleDetails = Partial<Pick<DataItem, 'title' | 'description' | 'pubDate' | 'updated' | 'author' | 'category'>> & { fragment?: string };
type ArticleLink = { link: string; title?: string };

export async function extractNews(item: Partial<ArticleLink>, selector: string): Promise<DataItem | DataItem[]> {
    const link = item.link;
    if (!link) {
        throw new NotFoundError('The VisionIAS article listing does not provide a link');
    }
    const article = { ...item, link };
    const details = await cache.tryGet(`visionias:article:v7:${link}`, () => fetchArticle(link, selector));
    return Array.isArray(details) ? details.map((detail) => createArticleItem(detail, article)) : createArticleItem(details, article);
}

function createArticleItem(details: ArticleDetails, item: ArticleLink): DataItem {
    const title = details.title || item.title;
    if (!title) {
        throw new NotFoundError(`No article headline was found at ${item.link}`);
    }
    return {
        title,
        link: details.fragment ? new URL(details.fragment, item.link).href : item.link,
        description: details.description,
        pubDate: details.pubDate,
        updated: details.updated,
        author: details.author,
        category: details.category,
    };
}

async function fetchArticle(link: string, selector: string): Promise<ArticleDetails | ArticleDetails[]> {
    const response = await ofetch(link);
    const $$ = load(response);
    const postedDate = $$('meta[property="article:published_time"]').attr('content');
    const updatedDate = $$('meta[property="article:modified_time"]').attr('content');
    const tags = $$('meta[property="article:tag"]')
        .toArray()
        .flatMap((tag) => {
            const value = $$(tag).attr('content');
            return value ? [value] : [];
        });
    const articleContent = $$('main .ck-content');
    const articleTitle = $$('main h1, div.space-y-4 h1').first().text();
    const modernShortArticles = $$('main [x-data^="{isShortArticleOpen"]');
    if (articleTitle && modernShortArticles.length) {
        return modernShortArticles.toArray().map((element) => {
            const article = $$(element);
            const fragment = article.find('a[href^="#"]').first().attr('href');
            if (!fragment) {
                throw new NotFoundError(`No short article anchor was found at ${link}`);
            }
            const description = article
                .find('.ck-content')
                .toArray()
                .map((content) => $$(content).html() ?? '')
                .join('');
            return {
                title: `${article.find('h2').first().text()} | ${articleTitle}`,
                fragment,
                description: description.trim() ? description : undefined,
                pubDate: parseArticleDate(postedDate),
                updated: parseArticleDate(updatedDate),
                author: $$('meta[name="author"]').attr('content'),
                category: article
                    .find('a[href*="/current-affairs/search?query="] span')
                    .toArray()
                    .map((tag) => $$(tag).text()),
            };
        });
    }
    if (articleContent.length && articleTitle) {
        return {
            title: articleTitle,
            description: articleContent
                .toArray()
                .map((element) => $$(element).html() ?? '')
                .join(''),
            pubDate: parseArticleDate(postedDate),
            updated: parseArticleDate(updatedDate),
            author: $$('meta[name="author"]').attr('content'),
            category: tags.filter((tag): tag is string => Boolean(tag)),
        };
    }
    const content = $$(selector);
    const heading = content.find('div.space-y-4 > h1').text();
    const mainGroup = content.find('div.flex > div.w-full');

    const shortArticles = mainGroup.find('[x-data^="{isShortArticleOpen"]');
    if (shortArticles.length !== 0) {
        const items = shortArticles.toArray().map((element) => {
            const mainDiv = $$(element);
            const title = mainDiv.find('a > div > h2').text();
            const id = mainDiv.find('a').attr('href');
            const htmlContent = extractArticle(mainDiv);
            const innerTags = mainDiv
                .find('ul > li:contains("Tags :")')
                ?.nextAll('li')
                .toArray()
                .map((tag) => $$(tag).text());
            const description = renderDescription({
                articleContent: htmlContent ?? undefined,
            });
            return {
                title: `${title} | ${heading}`,
                pubDate: parseArticleDate(postedDate),
                category: innerTags,
                description,
                fragment: id,
                updated: parseArticleDate(updatedDate),
                author: $$('meta[name="author"]').attr('content'),
            };
        });
        return items;
    }
    const sections = mainGroup.find('[x-data^="{isSectionOpen"]');
    if (sections.length === 0) {
        const htmlContent = extractArticle(mainGroup);
        const description = renderDescription({
            articleContent: htmlContent ?? undefined,
        });
        return {
            title: heading || undefined,
            pubDate: parseArticleDate(postedDate),
            category: tags,
            description,
            updated: parseArticleDate(updatedDate),
            author: $$('meta[name="author"]').attr('content'),
        };
    }
    const items = sections.toArray().map((element) => {
        const mainDiv = $$(element);
        const title = mainDiv.find('a > div > h2').text();
        const htmlContent = extractArticle(mainDiv);
        const description = renderDescriptionSub({
            heading: title,
            articleContent: htmlContent ?? undefined,
        });
        return { description };
    });
    const description = renderDescription({
        subItems: items,
    });
    return {
        title: heading,
        pubDate: parseArticleDate(postedDate),
        category: tags,
        description,
        updated: parseArticleDate(updatedDate),
        author: $$('meta[name="author"]').attr('content'),
    };
}

function extractArticle(articleDiv: Cheerio<AnyNode>): string {
    const articleContent = articleDiv.find('div.ck-content');
    articleContent.find('figure').each((_, element) => {
        articleContent.find(element).css('width', '');
    });
    const htmlContent = articleContent
        .toArray()
        .map((element) => articleContent.filter(element).html() ?? '')
        .join('');
    if (!htmlContent.trim()) {
        throw new NotFoundError('No article content was found in the VisionIAS page');
    }
    return htmlContent;
}

function parseArticleDate(value?: string) {
    return value && Number.isFinite(Date.parse(value)) ? parseDate(value) : undefined;
}

export function flattenNews<T>(results: Array<PromiseSettledResult<T | T[]>>): T[] {
    const failure = results.find((result) => result.status === 'rejected');
    if (failure) {
        throw failure.reason;
    }
    return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}
