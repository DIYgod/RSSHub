import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

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
    const articlesWithContent = (
        await pMap(
            $('.toc a').toArray(),
            async (item) => {
                const $item = $(item);
                const currentElement = $item;
                const dateElement = $item.prevAll('.date').first();
                const currentDate = dateElement.text();
                // Check if this is an article (either paper or note)
                if (currentElement.hasClass('paper') || currentElement.hasClass('note')) {
                    // Extract title and metadata from the list page
                    const title = currentElement.find('h3').text();
                    const author = currentElement.find('.byline').text();
                    const description = currentElement.find('.description').text().trim();
                    const href = currentElement.attr('href');
                    if (!href) {
                        return null;
                    }
                    const articleUrl = new URL(href, rootUrl).href;
                    const details = await cache.tryGet(`transformer-circuits:detail:v2:${articleUrl}`, () => fetchArticleDetails(articleUrl));
                    return {
                        title,
                        link: articleUrl,
                        pubDate: details.pubDate ?? parseDate(currentDate, 'MMMM YYYY'),
                        author: details.author || author,
                        description: details.description || renderToString(<p>{description}</p>),
                    };
                }
                return null;
            },
            { concurrency: 3, stopOnError: false }
        )
    ).filter((article) => article !== null);
    return {
        title: 'Transformer Circuits Thread',
        link: rootUrl,
        item: articlesWithContent,
        description: 'Research on reverse engineering transformer language models into human-understandable programs',
    };
}
function extractArticleAuthors($: CheerioAPI) {
    const byline = $('.d-byline-container .author');
    const names = byline.length
        ? byline.toArray().map((element) => {
              const author = $(element);
              author.find('sup').remove();
              return author.text().replace(/,$/, '').trim();
          })
        : $('.section-authors')
              .toArray()
              .flatMap((element) => {
                  const section = $(element);
                  section.find('sup, [style*="float: right"], [style*="font-size"]').remove();
                  const groups = section.children().length
                      ? section
                            .children()
                            .toArray()
                            .map((child) => $(child).text())
                      : [section.text()];
                  return groups.flatMap((group) =>
                      group
                          .split('; edited by', 1)[0]
                          .split(/,\s*|\s+and\s+/)
                          .map((name) =>
                              name
                                  .replaceAll(/\s+/g, ' ')
                                  .trim()
                                  .replace(/^and\s+/, '')
                          )
                  );
              });
    if (names.length) {
        return [...new Set(names)].join(', ');
    }
    const frontMatter = $('d-front-matter script[type="text/json"]').text();
    if (!frontMatter) {
        return;
    }
    const metadata: {
        authors: Array<{
            author: string;
        }>;
    } = JSON.parse(frontMatter);
    return metadata.authors.map((author) => author.author).join(', ');
}
function extractArticleDate($: CheerioAPI) {
    const sourceDate = $('.d-byline-container .published > div').text() || $('.section-authors [style*="float: right"]').text() || $('meta[name="citation_publication_date"]').attr('content');
    if (!sourceDate) {
        return;
    }
    const format = /^\d{4}\/\d{2}\/\d{2}$/.test(sourceDate) ? 'YYYY/MM/DD' : /\d(?:st|nd|rd|th),/.test(sourceDate) ? 'MMMM Do, YYYY' : undefined;
    return parseDate(sourceDate, format) ?? parseDate(sourceDate, 'MMMM D, YYYY');
}
async function fetchArticleDetails(url: string): Promise<Pick<DataItem, 'description' | 'author' | 'pubDate'>> {
    try {
        const response = await ofetch(url);
        const $ = load(response);
        const pubDate = extractArticleDate($);
        const author = extractArticleAuthors($);
        // Remove navigation and other unnecessary elements
        $('.article-header, .tooltip, modal, style, d-front-matter, .visual-toc, .d-byline-container, .section-authors').remove();
        // Get the main content - d-article is the custom tag used by this site
        let content = $('d-article').html();
        // If d-article not found, try more specific fallback selectors
        if (!content) {
            // Try to find content in common article containers, but avoid selecting the entire body
            content = $('main article, .article-content, .post-content, .content-area').html() || $('.content, .article, .post').html() || $('main').html();
            // If still no content found, log a warning
            if (!content) {
                logger.warn(`No suitable content container found for ${url}`);
            }
        }
        return { description: content, author, pubDate };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error fetching article content from ${url}: ${errorMessage}`);
        return {};
    }
}
