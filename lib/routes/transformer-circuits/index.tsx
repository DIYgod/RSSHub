import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

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
    const articlesWithContent = (
        await pMap(
            $('.toc a').toArray(),
            (item) => {
                const $item = $(item);
                const currentElement = $item;
                const dateElement = $item.prevAll('.date').first();
                const currentDate = dateElement.text().trim();
                // Check if this is an article (either paper or note)
                if (currentElement.hasClass('paper') || currentElement.hasClass('note')) {
                    // Extract title and metadata from the list page
                    const title = currentElement.find('h3').text();
                    let author = '';
                    const byline = currentElement.find('.byline');
                    if (byline.length) {
                        author = byline.text().trim();
                    }
                    const description = currentElement.find('.description').text().trim();
                    const href = currentElement.attr('href');
                    if (!href) {
                        return null;
                    }
                    const articleUrl = new URL(href, rootUrl).href;
                    return mapResolvedValue(
                        cache.tryGet(`transformer-circuits:detail:v2:${articleUrl}`, () => fetchArticleDetails(articleUrl)),
                        (details) => ({
                            title,
                            link: articleUrl,
                            pubDate: details.pubDate ?? parseArticleDate(currentDate, 'MMMM YYYY'),
                            author: details.author || author,
                            description: details.description || renderToString(<p>{description}</p>),
                        })
                    );
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
    const names: string[] = [];
    const byline = $('.d-byline-container .author');
    if (byline.length) {
        byline.each((_, element) => {
            const author = copyContent($(element), $);
            author.find('sup').remove();
            names.push(author.text().replace(/,$/, '').trim());
        });
    } else {
        $('.section-authors').each((_, element) => {
            const section = copyContent($(element), $);
            section.find('sup, [style*="float: right"], [style*="font-size"]').remove();
            const groups = section.children().length
                ? section
                      .children()
                      .toArray()
                      .map((child) => $(child).text())
                : [section.text()];
            for (const group of groups) {
                names.push(
                    ...group
                        .split('; edited by', 1)[0]
                        .split(/,\s*|\s+and\s+/)
                        .map((name) =>
                            name
                                .replaceAll(/\s+/g, ' ')
                                .trim()
                                .replace(/^and\s+/, '')
                        )
                );
            }
        });
        if (!names.length) {
            const frontMatter = $('d-front-matter script[type="text/json"]').first().text();
            if (frontMatter) {
                const metadata: {
                    authors?: Array<{
                        author?: string;
                    }>;
                } = JSON.parse(frontMatter);
                const sourceAuthors = metadata.authors ?? [];
                for (const author of sourceAuthors) {
                    if (author?.author) {
                        names.push(author.author);
                    }
                }
            }
        }
    }
    return [...new Set(names.filter(Boolean))].join(', ') || undefined;
}
function extractArticleDate($: CheerioAPI) {
    const sourceDate = $('.d-byline-container .published > div').first().text().trim() || $('.section-authors [style*="float: right"]').first().text().trim() || $('meta[name="citation_publication_date"]').attr('content');
    if (!sourceDate) {
        return;
    }
    const format = /^\d{4}\/\d{2}\/\d{2}$/.test(sourceDate) ? 'YYYY/MM/DD' : /\d(?:st|nd|rd|th),/.test(sourceDate) ? 'MMMM Do, YYYY' : undefined;
    return parseArticleDate(sourceDate, format);
}
function parseArticleDate(sourceDate: string, format?: string) {
    if (!sourceDate) {
        return;
    }
    const date = parseDate(sourceDate, format);
    return Number.isFinite(date.valueOf()) ? date : undefined;
}
async function fetchArticleDetails(url: string): Promise<Pick<DataItem, 'description' | 'author' | 'pubDate'>> {
    try {
        const response = await ofetch(url);
        const $ = load(response);
        const author = extractArticleAuthors($);
        const pubDate = extractArticleDate($);
        // Remove navigation and other unnecessary elements
        $('.article-header, .tooltip, modal, script, style, d-front-matter, .visual-toc, .d-byline-container, .section-authors').remove();
        $('d-article').children('h1[style*="grid-column: page"]').first().remove();
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
        return { description: content || undefined, author, pubDate };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error fetching article content from ${url}: ${errorMessage}`);
        return {};
    }
}
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
