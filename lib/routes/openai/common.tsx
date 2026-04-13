import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const BASE_URL = new URL('https://openai.com');

/** Fetch the details of an article. */
export const fetchArticleDetails = async (url: string) => {
    // Ensure trailing slash to avoid 301 redirect
    const normalizedUrl = url.endsWith('/') ? url : `${url}/`;
    const html = await ofetch(normalizedUrl, { responseType: 'text' });
    const $ = load(html);

    const $article = $('#main article');

    const categories = $('h1')
        .prev()
        .find('a[href]')
        .toArray()
        .map((element) => $(element).text());

    const authors = $('[data-testid="author-list"] a')
        .toArray()
        .map((element) => $(element).text());

    // Article header (title, sub title and categories)
    $($article.find('h1').parents().get(4)).remove();
    // Related articles (can be the #citations section in some cases, so the last child needs to be removed first)
    $article.children().last().remove();
    // Article authors and tags
    $article.find('#citations').remove();

    return {
        content: $article.html() ?? undefined,
        // Categories can be found on https://openai.com/news/ and https://openai.com/research/index/
        categories,
        image: $('meta[property="og:image"]').attr('content'),
        author: authors.join(', '),
        link: normalizedUrl,
    };
};

/** Fetch all articles from OpenAI's RSS feed. */
export const fetchArticles = async (limit: number, category?: string): Promise<DataItem[]> => {
    const page = await ofetch('https://openai.com/news/rss.xml', {
        responseType: 'text',
        headers: { 'User-Agent': config.ua },
    });

    const $ = load(page, { xml: true });

    let items = $('item').toArray();
    if (category) {
        items = items.filter((element) => $(element).find('category').text() === category);
    }

    return Promise.all(
        items.slice(0, limit).map<Promise<DataItem>>((element) => {
            const id = $(element).find('guid').text();

            return cache.tryGet(`openai:news:${id}`, async () => {
                const title = $(element).find('title').text();
                const pubDate = parseDate($(element).find('pubDate').text());
                const link = $(element).find('link').text();

                const { content, categories, author, link: articleLink } = await fetchArticleDetails(link);

                return {
                    guid: id,
                    title,
                    link: articleLink,
                    pubDate,
                    description: content,
                    category: categories,
                    author,
                } as DataItem;
            }) as Promise<DataItem>;
        })
    );
};
