import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

// Simple MediaWiki template parser for {{Current events}} template
function parseCurrentEventsTemplate(wikitext: string): string | null {
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

function processLines(html: string): string {
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

    return processedLines.join('\n');
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

    return result.join('\n');
}

function wrapInParagraphsAndCleanup(html: string): string {
    // Wrap in paragraphs and clean up
    if (!html.startsWith('<p>')) {
        html = '<p>' + html;
    }
    if (!html.endsWith('</p>')) {
        html = html + '</p>';
    }

    // Clean up multiple paragraph tags and empty paragraphs
    html = html.replaceAll(/<\/p>\s*<p>/g, '</p>\n<p>');
    html = html.replaceAll(/<p>\s*<\/p>/g, '');
    html = html.replaceAll(/<p>\s*<ul>/g, '<ul>');
    html = html.replaceAll(/<\/ul>\s*<\/p>/g, '</ul>');

    return html;
}

// Wiki markup to HTML converter with proper list handling
function wikiToHtml(wikitext: string): string {
    let html = wikitext;

    // Apply transformations in order
    html = convertWikiLinks(html);
    html = convertExternalLinks(html);
    html = convertTextFormatting(html);
    html = processLines(html);
    html = wrapListItems(html);
    html = processNestedLists(html);
    html = wrapInParagraphsAndCleanup(html);

    return html;
}

function getCurrentEventsDatePath(date: Date): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate(); // Not zero-padded

    return `Portal:Current_events/${year}_${month}_${day}`;
}

async function fetchWikiRaw(pageName: string): Promise<string> {
    const url = `https://en.wikipedia.org/wiki/${pageName}`;
    const response = await got(url, {
        searchParams: {
            action: 'raw',
        },
        headers: {
            'User-Agent': 'RSSHub/1.0 (+https://github.com/DIYgod/RSSHub)',
        },
    });

    return response.body;
}

export const route: Route = {
    path: '/current-events',
    categories: ['new-media'],
    example: '/wikipedia/current-events',
    parameters: {},
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

async function handler() {
    // Create array of dates for the past 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (i + 1));
        return date;
    });

    // Fetch all pages in parallel to avoid await-in-loop
    const fetchPromises = dates.map(async (date) => {
        const pageName = getCurrentEventsDatePath(date);
        const cacheKey = `wikipedia:current-events:${pageName}`;

        try {
            const wikitext = await cache.tryGet(cacheKey, async () => await fetchWikiRaw(pageName), 60 * 60 * 6); // Cache for 6 hours

            // Parse the Current events template content
            const content = parseCurrentEventsTemplate(wikitext);

            if (content) {
                // Convert wiki markup to HTML
                const html = wikiToHtml(content);

                const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

                return {
                    title: `Current events: ${dateStr}`,
                    link: `https://en.wikipedia.org/wiki/${pageName}`,
                    description: html,
                    pubDate: parseDate(date.toISOString()),
                    guid: `wikipedia-current-events-${dateStr}`,
                };
            }
        } catch {
            // Continue with other dates even if one fails
            return null;
        }
        return null;
    });

    const results = await Promise.all(fetchPromises);
    const items = results.filter((item) => item !== null);

    return {
        title: 'Wikipedia: Portal: Current events',
        link: 'https://en.wikipedia.org/wiki/Portal:Current_events',
        description: 'Current events from Wikipedia - Latest news and events',
        item: items,
    };
}
