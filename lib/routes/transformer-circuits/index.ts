import { Route, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'path';
import logger from '@/utils/logger';

// Define the main route path
export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/transformer-circuits',
    parameters: {},
    radar: [
        {
            source: ['transformer-circuits.pub/'],
            target: '/',
        },
    ],
    name: 'Articles',
    maintainers: ['shinmohuang'],
    handler,
};

async function handler() {
    const rootUrl = 'https://transformer-circuits.pub';

    // Fetch the main page
    const response = await ofetch(rootUrl);
    const $ = load(response);

    // Get all article links and basic info
    const articlePromises = $('.toc a')
        .toArray()
        .map(async (item) => {
            const $item = $(item);
            const currentElement = $item;
            const dateElement = $item.prevAll('.date').first();
            const currentDate = dateElement.text().trim();

            // Check if this is an article (either paper or note)
            if (currentElement.hasClass('paper') || currentElement.hasClass('note')) {
                const articleType = currentElement.hasClass('paper') ? 'Paper' : 'Note';

                // Extract title
                const title = currentElement.find('h3').text().trim();

                // Extract author if available
                let author = '';
                const byline = currentElement.find('.byline');
                if (byline.length) {
                    author = byline.text().trim();
                }

                // Extract description
                const description = currentElement.find('.description').text().trim();

                // Get the article URL
                const href = currentElement.attr('href');
                const articleUrl = href ? (href.startsWith('http') ? href : `${rootUrl}/${href}`) : rootUrl;

                // 使用 cache.tryGet 缓存文章内容
                const fullContent = await cache.tryGet(
                    articleUrl,
                    async () => await fetchArticleContent(articleUrl),
                    60 * 60 * 24 // 缓存24小时
                );

                // Create article object with full content
                return {
                    title,
                    link: articleUrl,
                    pubDate: parseDate(currentDate, 'MMMM YYYY'),
                    author,
                    description: fullContent || `${articleType}: ${description}`,
                    category: ['AI', 'Machine Learning', 'Anthropic', 'Transformer Circuits'],
                };
            }
            return null;
        });

    // Wait for all article fetches to complete
    const articlesWithContent = (await Promise.all(articlePromises)).filter(Boolean) as DataItem[];

    return {
        title: 'Transformer Circuits Thread',
        link: rootUrl,
        item: articlesWithContent,
        description: 'Research on reverse engineering transformer language models into human-understandable programs, feedId:128744138938804224+userId:94101804721377280',
    };
}

// Function to fetch and parse article content
async function fetchArticleContent(url) {
    try {
        logger.debug(`Fetching article content: ${url}`);
        const response = await ofetch(url, {
            timeout: 10000,
            retry: 2,
        });
        const $ = load(response);

        // Remove navigation and other unnecessary elements
        $('.article-header, .tooltip, modal, script, style, d-front-matter, .visual-toc').remove();

        // Get the main content - d-article is the custom tag used by this site
        let content = $('d-article').html();

        // If d-article not found, try fallback selectors
        if (!content) {
            content = $('main, article, .content, .post-content').html() || $('body').html();
        }

        // Create full HTML with proper styling
        return art(path.join(__dirname, 'templates/article.art'), {
            content,
            link: url,
            title: $('title').text() || url.split('/').pop(),
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error fetching article content from ${url}: ${errorMessage}`);
        return null; // Return null on error, we'll fall back to description
    }
}
