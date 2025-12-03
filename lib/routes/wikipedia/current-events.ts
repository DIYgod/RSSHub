import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

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
    // The closing }} is always at the end of wikitext
    const contentMatch = wikitext.match(/\{\{Current events\s*\|[\s\S]*?content\s*=\s*([\s\S]*)\}\}$/);
    if (!contentMatch) {
        return null;
    }

    let content = contentMatch[1].trim();

    // Strip comments to detect empty content
    content = stripComments(content);

    // Check if content is empty or only contains empty bullets (e.g., "*", "**", with whitespace)
    if (/^\s*\*+\s*$/.test(content)) {
        return null;
    }

    return content;
}

function stripTemplates(wikitext: string): string {
    // Remove MediaWiki template delimiters {{...}} but keep the content
    // This prevents conflicts with art-template's {{ }} delimiters in RSS generation
    return wikitext.replaceAll(/\{\{([^}]+)\}\}/g, '$1');
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

interface ListProcessorState {
    result: string[];
    depthStack: number[];
    lastDepth: number;
}

function createListProcessorState(): ListProcessorState {
    return {
        result: [],
        depthStack: [],
        lastDepth: 0,
    };
}

function addIndentedTag(state: ListProcessorState, tag: string): void {
    state.result.push('  '.repeat(state.depthStack.length) + tag);
}

function closeAllListsAndAddParagraph(state: ListProcessorState): void {
    while (state.depthStack.length > 0) {
        state.depthStack.pop();
        addIndentedTag(state, '</ul>');
        if (state.depthStack.length > 0) {
            addIndentedTag(state, '</li>');
        }
    }
    state.lastDepth = 0;
}

function openNestedLists(state: ListProcessorState, targetDepth: number): void {
    for (let d = state.lastDepth; d < targetDepth; d++) {
        addIndentedTag(state, '<ul>');
        state.depthStack.push(d + 1);
    }
}

function closeNestedLists(state: ListProcessorState, targetDepth: number): void {
    while (state.depthStack.length > 0 && state.depthStack.at(-1)! > targetDepth) {
        addIndentedTag(state, '</li>');
        state.depthStack.pop();
        addIndentedTag(state, '</ul>');

        if (state.depthStack.length > 0 && state.depthStack.at(-1)! > targetDepth) {
            // There's still more to close, the parent li will be closed in next iteration
        } else if (state.depthStack.length > 0) {
            // We're done going back up, close the parent <li>
            addIndentedTag(state, '</li>');
        }
    }
}

function closePreviousListItem(state: ListProcessorState): void {
    if (state.depthStack.length > 0) {
        addIndentedTag(state, '</li>');
    }
}

function closeAllOpenLists(state: ListProcessorState): void {
    if (state.depthStack.length === 0) {
        return;
    }

    // Close the deepest <li> first
    addIndentedTag(state, '</li>');
    state.depthStack.pop();

    // Then close all remaining </ul> and their parent </li>
    while (state.depthStack.length > 0) {
        state.result.push('  '.repeat(state.depthStack.length) + '</ul>', '  '.repeat(state.depthStack.length) + '</li>');
        state.depthStack.pop();
    }

    // Close the final </ul>
    state.result.push('</ul>');
}

function processListsAndLines(html: string): string {
    const lines = html.split('\n');
    const state = createListProcessorState();

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
            closeAllListsAndAddParagraph(state);
            continue;
        }

        // Check for bullet points
        const bulletMatch = trimmedLine.match(/^(\*+)\s*(.*)$/);
        if (bulletMatch) {
            const depth = bulletMatch[1].length;
            const content = bulletMatch[2];

            if (!content) {
                continue; // Skip empty bullets like "*"
            }

            // Handle depth changes
            if (depth > state.lastDepth) {
                openNestedLists(state, depth);
            } else if (depth < state.lastDepth) {
                closeNestedLists(state, depth);
            } else {
                closePreviousListItem(state);
            }

            // Add the new list item (leave it open for potential nested lists)
            addIndentedTag(state, `<li>${content}`);
            state.lastDepth = depth;
        } else {
            // Regular text line - close all lists
            closeAllListsAndAddParagraph(state);
            state.result.push(trimmedLine);
        }
    }

    closeAllOpenLists(state);
    return state.result.join('\n');
}

function stripComments(html: string): string {
    // Remove HTML comments
    return html.replaceAll(/<!--[\s\S]*?-->/g, '');
}

// Wiki markup to HTML converter with proper list handling
export function wikiToHtml(wikitext: string): string {
    let html = wikitext;

    // Apply transformations in order
    html = stripTemplates(html); // Must be first to prevent art-template conflicts
    html = convertWikiLinks(html);
    html = convertExternalLinks(html);
    html = convertTextFormatting(html);
    html = processListsAndLines(html);

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
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;

                    // Calculate the end of day in GMT-12 (latest timezone to complete a day)
                    // This is 23:59:59 on the given date in GMT-12, which equals 11:59:59 the next day in GMT
                    const endOfDayGMTMinus12 = Date.UTC(year, date.getMonth(), date.getDate() + 1, 11, 59, 59);

                    return {
                        title: `Current events: ${dateStr}`,
                        link: `https://en.wikipedia.org/wiki/${pageName}`,
                        description: html,
                        // we estimate pubDate by taking the min of the latest possible entry and current time
                        pubDate: new Date(Math.min(endOfDayGMTMinus12, Date.now())),
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
