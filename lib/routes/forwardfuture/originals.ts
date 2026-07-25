import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface OriginalPost {
    id: string;
    title: string;
    summary: string;
    url: string;
    date: string;
    dateUnix: number;
    thumbnail: string;
    authors: string[];
    category: string;
    categories: string[];
}

function unescapeJsString(input: string): string {
    const result: string[] = [];
    let i = 0;
    while (i < input.length) {
        const c = input[i];
        if (c === '\\' && i + 1 < input.length) {
            const next = input[i + 1];
            switch (next) {
                case '"':
                    result.push('"');
                    i += 2;
                    break;
                case '\\':
                    result.push('\\');
                    i += 2;
                    break;
                case 'n':
                    result.push('\n');
                    i += 2;
                    break;
                case 't':
                    result.push('\t');
                    i += 2;
                    break;
                case '/':
                    result.push('/');
                    i += 2;
                    break;
                default:
                    result.push(c);
                    i++;
            }
        } else {
            result.push(c);
            i++;
        }
    }
    return result.join('');
}

function extractPostsArray(input: string): string | null {
    const start = input.indexOf('"posts":');
    if (start === -1) {
        return null;
    }

    const arrayStart = start + '"posts":'.length;
    if (input[arrayStart] !== '[') {
        return null;
    }

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = arrayStart; i < input.length; i++) {
        const c = input[i];
        if (escape) {
            escape = false;
        } else if (c === '\\' && inString) {
            escape = true;
        } else if (c === '"' && !escape) {
            inString = !inString;
        } else if (!inString) {
            if (c === '[') {
                depth++;
            } else if (c === ']') {
                depth--;
                if (depth === 0) {
                    return input.slice(arrayStart, i + 1);
                }
            }
        }
    }

    return null;
}

export const route: Route = {
    name: 'Originals',
    categories: ['other'],
    path: '/originals',
    example: '/forwardfuture/originals',
    radar: [
        {
            source: ['forwardfuture.com/originals', 'forwardfuture.com/'],
        },
    ],
    handler,
    maintainers: ['ovo-Tim'],
    description: 'Original essays, columns, and analysis on AI from Forward Future contributors.',
};

async function handler(ctx: Context): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const posts = await cache.tryGet('forwardfuture:originals', async () => {
        const html = await ofetch<string>('https://forwardfuture.com/originals');

        const pushRegex = /__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
        let match: RegExpExecArray | null;

        while ((match = pushRegex.exec(html)) !== null) {
            const payload = match[1];
            if (!payload.includes('posts')) {
                continue;
            }

            const unescaped = unescapeJsString(payload);
            const arrayStr = extractPostsArray(unescaped);
            if (arrayStr) {
                try {
                    return JSON.parse(arrayStr) as OriginalPost[];
                } catch {
                    continue;
                }
            }
        }

        return [];
    });

    const items: DataItem[] = posts.slice(0, limit).map((post) => ({
        title: post.title,
        description: post.summary || post.title,
        link: post.url,
        pubDate: parseDate(post.date, 'MMM D, YYYY'),
        author: post.authors.join(', '),
        image: post.thumbnail,
        category: post.categories.length > 0 ? post.categories : post.category === 'General' ? undefined : [post.category],
    }));

    return {
        title: 'Forward Future - Originals',
        link: 'https://forwardfuture.com/originals',
        description: 'Original essays, columns, and analysis on AI from Forward Future contributors.',
        item: items,
        image: 'https://forwardfuture.com/images/logos/ff-icon.svg',
    };
}
