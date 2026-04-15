import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://platform.claude.com';
const targetUrl = `${baseUrl}/docs/en/release-notes/overview`;
const browserUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

export const route: Route = {
    path: '/release-notes',
    categories: ['program-update'],
    example: '/anthropic/release-notes',
    name: 'Platform Release Notes',
    maintainers: ['TonyRL'],
    handler,
    radar: [
        {
            source: ['platform.claude.com/docs/en/release-notes/overview'],
            target: '/release-notes',
        },
    ],
    url: 'platform.claude.com/docs/en/release-notes/overview',
};

async function handler() {
    const item = await cache.tryGet(targetUrl, async () => {
        const response = await fetch(targetUrl, {
            headers: {
                'user-agent': browserUa,
            },
        });
        const html = await response.text();
        const $ = load(html);

        const items = $('h3')
            .toArray()
            .map((heading) => {
                const $heading = $(heading);
                const title = $heading.text().trim();
                const anchor = $heading.find('[id]').last().attr('id') ?? title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
                const description = $heading
                    .nextUntil('h3')
                    .toArray()
                    .map((element) => $(element).prop('outerHTML'))
                    .join('');

                return {
                    title,
                    description,
                    pubDate: parseDate(title),
                    link: `${targetUrl}#${anchor}`,
                    guid: `anthropic-release-notes-${anchor}`,
                } satisfies DataItem;
            })
            .filter((entry) => /[A-Z][a-z]+\s+\d{1,2},\s+\d{4}/.test(entry.title));

        return {
            title: 'Anthropic Platform Release Notes',
            description: $('meta[name="description"]').attr('content') ?? 'Release notes for Claude Platform',
            items,
        };
    });

    if (item.items.length === 0) {
        const response = await fetch(targetUrl, {
            headers: {
                'user-agent': browserUa,
            },
        });
        const html = await response.text();

        return {
            title: item.title,
            description: item.description,
            link: targetUrl,
            item: [
                {
                    title: 'Anthropic Platform Release Notes',
                    description: html.match(/<main[\s\S]*<\/main>/)?.[0],
                    link: targetUrl,
                    guid: 'anthropic-platform-release-notes-fallback',
                },
            ],
        };
    }

    return {
        title: item.title,
        description: item.description,
        link: targetUrl,
        item: item.items,
    };
}
