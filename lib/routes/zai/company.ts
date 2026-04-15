import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

const targetUrl = 'https://z.ai/company';
const browserUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

function parseTimelineEntries(html: string): DataItem[] {
    const $ = load(html);
    const script = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((text) => text.includes('ZhipuAI Founded') && (text.includes(String.raw`\"items\"`) || text.includes('"items"')));

    if (!script) {
        return [];
    }

    const match = script.match(/\\"items\\":(\[[\s\S]*?\])\}\]\}\]\n?/);
    if (!match) {
        return [];
    }

    const escapedQuotePlaceholder = '__RSSHUB_ESCAPED_QUOTE__';
    const normalized = match[1]
        .replaceAll(String.raw`\\\"`, escapedQuotePlaceholder)
        .replaceAll(String.raw`\"`, '"')
        .replaceAll(escapedQuotePlaceholder, String.raw`\"`);
    const entries = JSON.parse(normalized) as Array<{ id: string; year: number; date: string; title: string; description: string }>;

    return entries.map((entry) => ({
        title: entry.title,
        description: `<p>${entry.description}</p>`,
        link: `${targetUrl}#${entry.id}`,
        pubDate: parseDate(`${entry.date} ${entry.year}`),
        guid: `zai-company-${entry.id}`,
    }));
}

export const route: Route = {
    path: '/company',
    categories: ['program-update'],
    example: '/zai/company',
    name: 'Company Timeline',
    maintainers: ['goestav'],
    handler,
    radar: [
        {
            source: ['z.ai/company'],
            target: '/company',
        },
    ],
    url: 'z.ai/company',
};

async function handler() {
    const item = await cache.tryGet(targetUrl, async () => {
        const response = await fetch(targetUrl, {
            headers: {
                'user-agent': browserUa,
            },
        });
        return parseTimelineEntries(await response.text());
    });

    const page = await fetch(targetUrl, {
        headers: {
            'user-agent': browserUa,
        },
    });
    const html = await page.text();
    const $ = load(html);

    return {
        title: 'Z.ai Company Timeline',
        description: $('meta[name="description"]').attr('content') ?? 'Company timeline from Z.ai',
        link: targetUrl,
        item,
    };
}
