import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const baseUrl = 'https://visionias.in';

type ArticleDetails = Omit<DataItem, 'link'> & { fragment?: string };

export async function extractNews(link: string): Promise<DataItem | DataItem[]> {
    const details = await cache.tryGet(`visionias:article:v7:${link}`, () => fetchArticle(link));
    return Array.isArray(details) ? details.map((detail) => createArticleItem(detail, link)) : createArticleItem(details, link);
}

function createArticleItem(details: ArticleDetails, link: string): DataItem {
    return {
        title: details.title,
        link: details.fragment ? new URL(details.fragment, link).href : link,
        description: details.description,
        pubDate: details.pubDate,
        updated: details.updated,
        author: details.author,
        category: details.category,
    };
}

async function fetchArticle(link: string): Promise<ArticleDetails | ArticleDetails[]> {
    const response = await ofetch(link);
    const $$ = load(response);
    const postedDate = $$('meta[property="article:published_time"]').attr('content');
    const updatedDate = $$('meta[property="article:modified_time"]').attr('content');
    const pubDate = postedDate ? parseDate(postedDate) : undefined;
    const updated = updatedDate ? parseDate(updatedDate) : undefined;
    const author = $$('meta[name="author"]').attr('content');
    const articleTitle = $$('main h1, div.space-y-4 h1').first().text();
    const shortArticles = $$('main [x-data^="{isShortArticleOpen"]');
    if (shortArticles.length) {
        return shortArticles.toArray().map((element) => {
            const article = $$(element);
            const description = article.find('.ck-content').html();
            return {
                title: `${article.find('h2').text()} | ${articleTitle}`,
                fragment: article.find('a[href^="#"]').attr('href'),
                description: description?.trim() ? description : undefined,
                pubDate,
                updated,
                author,
                category: article
                    .find('a[href*="/current-affairs/search?query="] span')
                    .toArray()
                    .map((tag) => $$(tag).text()),
            };
        });
    }
    return {
        title: articleTitle,
        description: $$('main .ck-content').html(),
        pubDate,
        updated,
        author,
        category: $$('meta[property="article:tag"]')
            .toArray()
            .map((tag) => tag.attribs.content),
    };
}
