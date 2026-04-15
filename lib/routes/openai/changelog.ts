import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://platform.openai.com';
const targetUrl = `${baseUrl}/docs/changelog`;
const browserUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

function buildTitle(item: DataItem, fallback: string): string {
    const text = load(`<div>${item.description ?? ''}</div>`)('p')
        .first()
        .text()
        .trim();

    return text || fallback;
}

export const route: Route = {
    path: '/changelog',
    categories: ['program-update'],
    example: '/openai/changelog',
    radar: [
        {
            source: ['platform.openai.com/docs/changelog'],
            target: '/changelog',
        },
    ],
    name: 'API Changelog',
    maintainers: ['goestav'],
    handler,
    url: 'platform.openai.com/docs/changelog',
};

async function handler() {
    const response = await fetch(targetUrl, {
        headers: {
            'user-agent': browserUa,
        },
    });
    const html = await response.text();
    const $ = load(html);

    const items: DataItem[] = [];
    const sections = [...html.matchAll(/<h3[^>]*>([A-Z][a-z]+,\s+\d{4})<\/h3>([\s\S]*?)(?=<h3[^>]*>[A-Z][a-z]+,\s+\d{4}<\/h3>|$)/g)];

    for (const [sectionIndex, sectionMatch] of sections.entries()) {
        const month = sectionMatch[1];
        const sectionHtml = sectionMatch[2];
        const entries = [...sectionHtml.matchAll(/<div class="grid[^"]*">[\s\S]*?data-variant="outline">([^<]+)<\/div>[\s\S]*?<div class="_MarkdownContent[^"]*_ChangelogMarkdown[^"]*">([\s\S]*?)<\/div>[\s\S]*?<\/div>\s*<\/div>/g)];

        for (const [entryIndex, entryMatch] of entries.entries()) {
            const day = entryMatch[1].trim();
            const description = entryMatch[2];
            const monthName = month.split(',')[0];
            const year = month.split(',').at(-1)?.trim() ?? '';
            const dayNumber = day.split(' ').at(-1) ?? day;
            const pubDate = parseDate(`${monthName} ${dayNumber} ${year}`);
            const item: DataItem = {
                title: '',
                description,
                pubDate,
                link: targetUrl,
                guid: `openai-changelog-${sectionIndex}-${entryIndex}-${monthName}-${dayNumber}-${year}`,
            };
            item.title = buildTitle(item, `${month} ${day}`);
            items.push(item);
        }
    }

    const item = await Promise.all(
        items.map((entry) =>
            cache.tryGet(entry.guid!, () => ({
                ...entry,
            }))
        )
    );

    if (item.length === 0) {
        return {
            title: 'OpenAI API Changelog',
            description: $('meta[name="description"]').attr('content'),
            link: targetUrl,
            item: [
                {
                    title: 'OpenAI API Changelog',
                    description: html.match(/<div class="_ChangelogPage[\s\S]*?<\/main>/)?.[0],
                    link: targetUrl,
                    guid: 'openai-api-changelog-fallback',
                },
            ],
        };
    }

    return {
        title: 'OpenAI API Changelog',
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item,
    };
}
