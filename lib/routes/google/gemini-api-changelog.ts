import { load } from 'cheerio';
import { request } from 'undici';

import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

const targetUrl = 'https://ai.google.dev/gemini-api/docs/changelog?hl=en';
const browserUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

export const route: Route = {
    path: '/gemini-api/changelog',
    categories: ['program-update'],
    example: '/google/gemini-api/changelog',
    name: 'Gemini API Changelog',
    maintainers: ['Loongphy'],
    handler,
    radar: [
        {
            source: ['ai.google.dev/gemini-api/docs/changelog'],
            target: '/gemini-api/changelog',
        },
    ],
    url: 'ai.google.dev/gemini-api/docs/changelog',
};

async function handler() {
    const response = await request(targetUrl, {
        headers: {
            'user-agent': browserUa,
        },
    });
    const html = await response.body.text();
    const item = [...html.matchAll(/<h2 id="([^"]+)"[^>]*>([^<]+)<\/h2>([\s\S]*?)(?=<h2 id=|<\/div>\s*<\/article>|$)/g)].map((match, index) => ({
        title: match[2].trim(),
        description: load(`<div>${match[3]}</div>`)('div').html() ?? undefined,
        pubDate: parseDate(match[2].trim()),
        link: `${targetUrl}#${match[1]}`,
        guid: `gemini-api-changelog-${index}-${match[1]}`,
    })) satisfies DataItem[];

    if (item.length === 0) {
        const fallbackBody = html.match(/<div class="devsite-article-body clearfix ">([\s\S]*?)<\/devsite-content>/)?.[1];

        return {
            title: 'Gemini API Release Notes',
            description: 'Release notes for the Gemini API',
            link: targetUrl,
            item: [
                {
                    title: 'Gemini API Release Notes',
                    description: fallbackBody,
                    link: targetUrl,
                    guid: 'gemini-api-changelog-fallback',
                },
            ],
        };
    }

    return {
        title: 'Gemini API Release Notes',
        description: 'Release notes for the Gemini API',
        link: targetUrl,
        item,
    };
}
