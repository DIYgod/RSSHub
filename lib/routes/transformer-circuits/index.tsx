import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
        .map((item) => {
            const $item = $(item);
            const currentElement = $item;
            const dateElement = $item.prevAll('.date').first();
            const currentDate = dateElement.text().trim();

            // Check if this is an article (either paper or note)
            if (currentElement.hasClass('paper') || currentElement.hasClass('note')) {
                const articleType = currentElement.hasClass('paper') ? 'Paper' : 'Note';

                // Extract title and metadata from the list page
                const title = currentElement.find('h3').text().trim();
                let author = '';
                const byline = currentElement.find('.byline');
                if (byline.length) {
                    author = byline.text().trim();
                }
                const description = currentElement.find('.description').text().trim();
                const href = currentElement.attr('href');
                const articleUrl = href ? (href.startsWith('http') ? href : `${rootUrl}/${href}`) : rootUrl;

                // Cache the whole article object instead of just the content
                return cache.tryGet(articleUrl, async () => {
                    const fullContent = await fetchArticleContent(articleUrl);
                    return {
                        title,
                        link: articleUrl,
                        pubDate: parseDate(currentDate, 'MMMM YYYY'),
                        author,
                        description: fullContent || `${articleType}: ${description}`,
                        category: ['AI', 'Machine Learning', 'Anthropic', 'Transformer Circuits'],
                    };
                });
            }
            return null;
        });

    // Wait for all article fetches to complete
    const articlesWithContent = (await Promise.all(articlePromises)).filter(Boolean) as DataItem[];

    return {
        title: 'Transformer Circuits Thread',
        link: rootUrl,
        item: articlesWithContent,
        description: 'Research on reverse engineering transformer language models into human-understandable programs',
    };
}

// Function to fetch and parse article content
async function fetchArticleContent(url) {
    try {
        const response = await ofetch(url);
        const $ = load(response);

        // Remove navigation and other unnecessary elements
        $('.article-header, .tooltip, modal, script, style, d-front-matter, .visual-toc').remove();

        // Get the main content - d-article is the custom tag used by this site
        let content = $('d-article').html();

        // If d-article not found, try more specific fallback selectors
        if (!content) {
            // Try to find content in common article containers, but avoid selecting the entire body
            content = $('main article, .article-content, .post-content, .content-area').html() || $('.content, .article, .post').html() || $('main').html();

            // If still no content found, log a warning
            if (!content) {
                logger.warn(`No suitable content container found for ${url}`);
                content = `<p>Could not extract content. Please visit <a href="${url}">the original page</a>.</p>`;
            }
        }

        // Create an HTML fragment (not a full document) for the RSS description
        return renderToString(<TransformerCircuitsArticle content={content} link={url} />);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error fetching article content from ${url}: ${errorMessage}`);
        return null; // Return null on error, we'll fall back to description
    }
}

const articleStyles = `
    .content-wrapper {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
    }
    img {
        max-width: 100%;
        height: auto;
    }
    pre, code {
        background-color: #f5f5f5;
        border-radius: 3px;
        padding: 0.2em 0.4em;
        overflow-x: auto;
    }
    a {
        color: #0366d6;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
    h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
    }
    p, ul, ol {
        margin-bottom: 16px;
    }
    .read-original {
        margin-top: 30px;
        margin-bottom: 30px;
        text-align: center;
        padding: 10px;
        background-color: #f7f7f7;
        border-radius: 4px;
    }
    /* Support for custom elements used on transformer-circuits website */
    d-figure, figure {
        margin: 20px 0;
        text-align: center;
    }
    d-byline {
        font-size: 0.9em;
        color: #666;
        margin: 15px 0;
    }
    .gdoc-image img {
        max-width: 100%;
        display: block;
        margin: 0 auto;
    }
`;

const TransformerCircuitsArticle = ({ content, link }: { content: string; link: string }) => (
    <>
        <style>{articleStyles}</style>
        <div class="content-wrapper">{raw(content)}</div>
        <div class="read-original">
            <a href={link} target="_blank">
                Read Original
            </a>
        </div>
    </>
);
