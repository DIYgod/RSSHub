import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { DataItem } from '@/types';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';

export const rootUrl = 'https://scroll.in';
// Helper function to map article data to a consistent format
function mapArticle(article: any) {
    return {
        title: article.title,
        link: article.permalink,
        description: article.summary || '',
        itunes_item_image: article.cover?.large || '',
        image: article.cover?.large || '',
        author:
            article.authors?.length > 0
                ? article.authors.map((author: any) => ({
                      name: author?.name,
                      url: `${rootUrl}/author/${author?.id}`,
                      avatar: author?.headshot || '',
                  }))
                : '',
        pubDate: article.published ? parseDate(article.published) : undefined,
    };
}

export async function extractFeedArticleLinks(feedPath: string) {
    const feedUrl = `${rootUrl}/feed/${feedPath}/page/1`;
    let response;

    try {
        response = await ofetch(feedUrl);
    } catch (error) {
        logger.info(`Regular API fetch failed for ${feedUrl}, trying with puppeteer: ${error.message}`);
        response = await fetchWithPuppeteer(feedUrl);
    }

    if (!response?.articles) {
        return [];
    }

    const allArticles = response.articles.flatMap((section: any) => section.blocks?.filter((block: any) => block.type === 'row-stories').flatMap((block: any) => block.articles || []) || []);

    return allArticles.map((article) => mapArticle(article)).filter((item: any) => item.title && item.link);
}

export async function extractTrendingArticles() {
    const feedUrl = `${rootUrl}/feed/series/1/page/1`;
    let response;

    try {
        response = await ofetch(feedUrl);
    } catch (error) {
        logger.info(`Regular API fetch failed for ${feedUrl}, trying with puppeteer: ${error.message}`);
        response = await fetchWithPuppeteer(feedUrl);
    }

    if (!response?.articles) {
        return [];
    }

    // Filter for trending blocks which have title: "Trending"
    const trendingBlocks = response.articles.flatMap((section: any) => section.blocks || []).filter((block: any) => block.title === 'Trending' && block.type === 'list-collection-stories');

    if (!trendingBlocks.length) {
        return [];
    }

    // Combine articles from all trending blocks
    const trendingArticles = trendingBlocks.flatMap((block: any) => block.articles || []);

    return trendingArticles.map((article) => mapArticle(article)).filter((item: any) => item.title && item.link);
}

async function fetchWithPuppeteer(url: string): Promise<any> {
    let browser = null;
    try {
        browser = await puppeteer();
        const page = await browser.newPage();

        // Set up request interception to capture API responses
        await page.setRequestInterception(true);

        let apiResponse = null;

        page.on('request', (request) => {
            request.continue();
        });

        page.on('response', async (response) => {
            if (response.url() === url) {
                try {
                    apiResponse = await response.json();
                } catch {
                    // Not JSON or other error
                }
            }
        });

        logger.http(`Requesting API ${url} with puppeteer due to anti-crawling measures`);

        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        await page.close();

        return apiResponse;
    } catch (error) {
        logger.error(`Puppeteer error when fetching API ${url}: ${error.message}`);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export function fetchArticleContent(item: any): Promise<DataItem> {
    return cache.tryGet(item.link, async () => {
        try {
            // First try with regular fetch
            const articleResponse = await ofetch(item.link);
            const $article = load(articleResponse);
            const category = $article('.article-tags-list a.tag-menu')
                .toArray()
                .map((tag) => $article(tag).text().trim());

            // Remove elements that shouldn't be in the content
            $article('.below-article-share-block').nextAll().remove();
            $article('.below-article-share-block').remove();
            $article('header').remove(); // Remove all header tags
            $article('i.mail-us-section').remove(); // Remove mail us section
            $article('ul.article-tags-list').remove();

            // Get content after header removal
            const content = $article('.story-element').html() || $article('article .content').html() || $article('.article-content').html() || item.description;

            return {
                ...item,
                description: content,
                category,
            } as DataItem;
        } catch (error) {
            // If regular fetch fails, try with puppeteer
            logger.info(`Regular fetch failed for ${item.link}, trying with puppeteer: ${error.message}`);
            try {
                const puppeteerResponse = await fetchWithPuppeteer(item.link);
                const $article = load(puppeteerResponse);
                const category = $article('.article-tags-list a.tag-menu')
                    .toArray()
                    .map((tag) => $article(tag).text().trim());

                // Remove elements that shouldn't be in the content
                $article('.below-article-share-block').nextAll().remove();
                $article('.below-article-share-block').remove();
                $article('header').remove(); // Remove all header tags
                $article('i.mail-us-section').remove(); // Remove mail us section
                $article('ul.article-tags-list').remove();

                // Get content after header removal
                const content = $article('.story-element').html() || $article('article .content').html() || $article('.article-content').html() || item.description;

                return {
                    ...item,
                    description: content,
                    category,
                } as DataItem;
            } catch (puppeteerError) {
                logger.error(`Both fetch methods failed for ${item.link}: ${puppeteerError.message}`);
                return item as DataItem;
            }
        }
    });
}
