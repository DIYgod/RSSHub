import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

/* The different ways to query Wikipedia's Current Events

User-facing pages. Can call them with ?action=render to only get the html of the content
  1. portal: `https://en.wikipedia.org/wiki/Portal:Current_events`
  2. single day: `https://en.wikipedia.org/w/index.php?title=Portal:Current_events/2025_September_20`
  3. section that is included in the portal, 7 most recent days: `https://en.wikipedia.org/wiki/Portal:Current_events/Inclusion`

API at `https://en.wikipedia.org/w/api.php`. Can target:
  4. multiple pages, result in wikitext, may have continuation with:
     `action=query&format=json&prop=revisions&rvprop=content&rvslots=main&titles=${page1|page2|...}`,
  5. a single page, result in html with:
     `action=parse&format=json&page=${page}` (with page being a page link) or
     `https://en.wikipedia.org/w/api.php?action=parse&format=json&contentmodel=wikitext&text={{wikitext}}` (wikitext is a wikitext expression)
  6. multiple pages, result in html, will have continuation for more than 1 page with (note rvparse is obsolete):
     `action=query&format=json&rvprop=content&rvparse=true${page1|page2|...}`

Notes:
  7. combining 5. and 3. as `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=Portal:Current_events/Inclusion`
     seems good but doesn't let exclude the most recent day if too early
  8. combining 5. and 4. as `https://en.wikipedia.org/w/api.php?action=parse&format=json&contentmodel=wikitext&text={{Portal:Current events/Inclusion|2025|09|20}}`
     variant that fix the above

  - the rendered html still need some processing:
    - for inclusion pages, split in separate days
    - extract the significant div of each day
    - strip css and possibly class/id
  - if the result is in wikitext, it needs to be converted to html

4. is the fastest and current implementation. */

function getCurrentEventsDatePath(date: Date): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate(); // Not zero-padded

    return `Portal:Current_events/${year}_${month}_${day}`;
}

// Simple MediaWiki template parser for {{Current events}} template
function parseCurrentEventsTemplate(wikitext: string): string | null {
    if (!wikitext || typeof wikitext !== 'string') {
        return null;
    }

    // Look for {{Current events|content=...}} template
    const templateMatch = wikitext.match(/\{\{Current events\s*\|[\s\S]*?content\s*=\s*([\s\S]*?)\}\}/);
    if (!templateMatch) {
        return null;
    }

    return templateMatch[1].trim();
}

function convertWikiLinks(html: string): string {
    // Convert wiki links [[Link|Text]] or [[Link]]
    html = html.replaceAll(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<a href="https://en.wikipedia.org/wiki/$1">$2</a>');
    html = html.replaceAll(/\[\[([^\]]+)\]\]/g, '<a href="https://en.wikipedia.org/wiki/$1">$1</a>');
    return html;
}

function convertExternalLinks(html: string): string {
    // Convert external links [URL Text] or [URL]
    html = html.replaceAll(/\[([^\s\]]+)\s+([^\]]+)\]/g, '<a href="$1">$2</a>');
    html = html.replaceAll(/\[([^\s\]]+)\]/g, '<a href="$1">$1</a>');
    return html;
}

function convertTextFormatting(html: string): string {
    // Convert bold '''text'''
    html = html.replaceAll(/'''([^']+)'''/g, '<strong>$1</strong>');
    // Convert italic ''text''
    html = html.replaceAll(/''([^']+)''/g, '<em>$1</em>');
    return html;
}

function processListsAndLines(html: string): string {
    const lines = html.split('\n');
    const processedLines: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
            // Empty line - add paragraph break
            processedLines.push('</p><p>');
            continue;
        }

        // Check for bullet points and convert to proper nesting
        const bulletMatch = trimmedLine.match(/^(\*+)\s*(.+)$/);
        if (bulletMatch) {
            const depth = bulletMatch[1].length;
            const content = bulletMatch[2];

            // Create proper nested list structure
            const indent = '  '.repeat(depth - 1);
            processedLines.push(`${indent}<li>${content}</li>`);
        } else {
            // Regular text line
            processedLines.push(trimmedLine);
        }
    }

    let results = processedLines.join('\n');

    // Process lists
    results = wrapListItems(results);
    return processNestedLists(results);
}

function wrapListItems(html: string): string {
    // Convert consecutive <li> elements into proper <ul> structures
    return html.replaceAll(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, (match) => `<ul>\n${match}\n</ul>`);
}

function processNestedLists(html: string): string {
    const finalLines = html.split('\n');
    const result: string[] = [];
    let currentDepth = 0;
    const openTags: string[] = [];

    for (const line of finalLines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('<li>')) {
            const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
            const depth = Math.floor(indent / 2) + 1;

            // Close deeper levels
            while (currentDepth > depth) {
                result.push('  '.repeat(currentDepth - 1) + '</ul>');
                openTags.pop();
                currentDepth--;
            }

            // Open new level if needed
            if (currentDepth < depth) {
                result.push('  '.repeat(depth - 1) + '<ul>');
                openTags.push('ul');
                currentDepth = depth;
            }

            result.push('  '.repeat(depth) + trimmed);
        } else {
            // Close all open lists
            while (currentDepth > 0) {
                result.push('  '.repeat(currentDepth - 1) + '</ul>');
                openTags.pop();
                currentDepth--;
            }

            if (trimmed === '</p><p>') {
                result.push('</p>\n<p>');
            } else if (trimmed) {
                result.push(trimmed);
            }
        }
    }

    // Close any remaining open lists
    while (currentDepth > 0) {
        result.push('  '.repeat(currentDepth - 1) + '</ul>');
        currentDepth--;
    }

    return result.join('');
}

function stripComments(html: string): string {
    // Remove HTML comments
    return html.replaceAll(/<!--[\s\S]*?-->/g, '');
}

function wrapInParagraphsAndCleanup(html: string): string {
    // Clean up multiple paragraph tags and empty paragraphs
    html = html.replaceAll(/<\/p>\s*<p>/g, '</p>\n<p>');
    html = html.replaceAll(/<p>\s*<ul>/g, '<ul>');
    html = html.replaceAll(/<\/ul>\s*<\/p>/g, '</ul>');

    // Remove any empty paragraphs (be aggressive about it)
    html = html.replaceAll(/<p>[\s\n\r]*<\/p>/g, '');
    html = html.replaceAll(/<p>\s*<\/p>/g, '');
    html = html.replaceAll('<p></p>', '');

    // Final cleanup - remove trailing empty paragraphs that might have been added
    html = html.replaceAll(/<p>\s*$/g, '').replaceAll(/\s*<\/p>$/g, '');

    return html;
}

// Wiki markup to HTML converter with proper list handling
function wikiToHtml(wikitext: string): string {
    let html = wikitext;

    // Apply transformations in order
    html = convertWikiLinks(html);
    html = convertExternalLinks(html);
    html = convertTextFormatting(html);
    html = processListsAndLines(html);
    html = wrapInParagraphsAndCleanup(html);
    html = stripComments(html);

    return html;
}

async function fetchMultipleWikiContent(pageNames: string[]): Promise<Record<string, string>> {
    const url = 'https://en.wikipedia.org/w/api.php';
    const titles = pageNames.join('|');
    const results: Record<string, string> = {};

    let continueParams: Record<string, string> = {};

    let hasMore = true;
    while (hasMore) {
        const searchParams = {
            action: 'query',
            format: 'json',
            titles,
            prop: 'revisions',
            rvprop: 'content',
            rvslots: 'main',
            ...continueParams,
        };

        // eslint-disable-next-line no-await-in-loop
        const response = await got(url, {
            searchParams,
            headers: {
                'User-Agent': config.trueUA,
            },
        });

        const data = JSON.parse(response.body);

        if (data.query && data.query.pages) {
            for (const page of Object.values(data.query.pages)) {
                if (page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main) {
                    const wikitext = page.revisions[0].slots.main['*'];

                    // Parse the Current events template content
                    const content = parseCurrentEventsTemplate(wikitext);

                    if (content) {
                        // Convert wiki markup to HTML
                        const html = wikiToHtml(content);

                        // Use the page title as the key
                        const pageTitle = page.title;
                        // Convert back to the format we expect: "Portal:Current_events/2025_September_18"
                        const normalizedTitle = pageTitle.replace(/Portal:Current events\/(\d{4}) (\w+) (\d+)/, 'Portal:Current_events/$1_$2_$3');
                        results[normalizedTitle] = html;
                    }
                }
            }
        }

        // Check for continuation
        if (data.continue) {
            continueParams = data.continue;
        } else {
            hasMore = false;
        }
    }

    return results;
}

export const route: Route = {
    path: '/current-events/:includeToday?',
    categories: ['new-media'],
    example: '/wikipedia/current-events',
    parameters: {
        includeToday: {
            description: 'Include current day events (may be incomplete early in the day)',
            default: 'auto',
            options: [
                {
                    label: 'Auto (include after 18:00 UTC)',
                    value: 'auto',
                },
                {
                    label: 'Always include current day',
                    value: 'always',
                },
                {
                    label: 'Never include current day',
                    value: 'never',
                },
                {
                    label: 'Include after specific UTC hour (0-23)',
                    value: '0-23',
                },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['en.wikipedia.org/wiki/Portal:Current_events'],
            target: '/wikipedia/current-events',
        },
    ],
    name: 'Current Events',
    maintainers: ['aavanian'],
    handler,
    description: 'Wikipedia Portal: Current events - Latest news and events from the past 7 days',
};

async function handler(ctx) {
    const includeToday = ctx.req.param('includeToday') ?? 'auto';

    // Determine if we should include today's events
    const dates = determineDates(includeToday);

    // Create array of page names for batch request
    const pageNames = dates.map((date) => getCurrentEventsDatePath(date));
    const cacheKey = 'wikipedia:current-events:batch:' + pageNames.join('|');

    try {
        // Single batch request for all pages
        const contentMap = await cache.tryGet(cacheKey, async () => await fetchMultipleWikiContent(pageNames), config.cache.contentExpire);

        // Build RSS items from the fetched content
        const items = dates
            .map((date) => {
                const pageName = getCurrentEventsDatePath(date);
                const html = contentMap[pageName];

                if (html) {
                    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

                    return {
                        title: `Current events: ${dateStr}`,
                        link: `https://en.wikipedia.org/wiki/${pageName}`,
                        description: html,
                        pubDate: parseDate(date.toISOString()),
                        guid: `wikipedia-current-events-${dateStr}`,
                    };
                }
                return null;
            })
            .filter((item) => item !== null);

        return {
            title: 'Wikipedia: Portal: Current events',
            link: 'https://en.wikipedia.org/wiki/Portal:Current_events',
            description: 'Current events from Wikipedia - Latest news and events',
            item: items,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch Wikipedia current events: ${message}`);
    }
}
function determineDates(includeToday: any) {
    const now = new Date();
    const currentHourUTC = now.getUTCHours();

    let shouldIncludeToday = false;

    switch (includeToday) {
        case 'always':
            shouldIncludeToday = true;

            break;

        case 'never':
            shouldIncludeToday = false;

            break;

        case 'auto':
            // Include after 18:00 UTC (6 PM)
            shouldIncludeToday = currentHourUTC >= 18;

            break;

        default:
            if (/^\d+$/.test(includeToday)) {
                // Include after specific hour (0-23)
                const targetHour = Number.parseInt(includeToday, 10);
                if (targetHour >= 0 && targetHour <= 23) {
                    shouldIncludeToday = currentHourUTC >= targetHour;
                }
            }
    }

    // Create array of dates for the past 7 days, optionally including today
    const startOffset = shouldIncludeToday ? 0 : 1;
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (i + startOffset));
        return date;
    });
    return dates;
}
