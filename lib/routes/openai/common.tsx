import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const BASE_URL = new URL('https://openai.com');

/** Fetch the details of an article. */
const fetchArticleDetails = async (url: string) => {
    // Ensure trailing slash to avoid 301 redirect
    const articleUrl = new URL(url);
    if (!articleUrl.pathname.endsWith('/')) {
        articleUrl.pathname += '/';
    }
    const normalizedUrl = articleUrl.href;
    const html = await ofetch(normalizedUrl, {
        // OpenAI article pages return Cloudflare 403 challenges when Undici negotiates HTTP/2.
        allowH2: false,
        responseType: 'text',
    });
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
        content: $article.html(),
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

    return pMap(
        items.slice(0, limit),
        async (element): Promise<DataItem> => {
            const id = $(element).find('guid').text();
            const title = $(element).find('title').text();
            const publishedAt = $(element).find('pubDate').text();
            const pubDate = publishedAt ? parseDate(publishedAt) : undefined;
            const link = $(element).find('link').text();
            const { content, categories, author, link: articleLink } = await cache.tryGet(`openai:news:detail:v2:${id}`, () => fetchArticleDetails(link));

            return {
                guid: id,
                title,
                link: articleLink,
                pubDate,
                description: content,
                category: categories,
                author,
            };
        },
        { concurrency: 3 }
    );
};
