import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
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

function extractPostsArray(rscPayload: string): OriginalPost[] | null {
    let searchStart = 0;
    while (searchStart < rscPayload.length) {
        const postsIdx = rscPayload.indexOf('"posts":', searchStart);
        if (postsIdx === -1) {
            return null;
        }

        const arrayStart = postsIdx + '"posts":'.length;
        if (rscPayload[arrayStart] !== '[') {
            searchStart = arrayStart;
            continue;
        }

        let depth = 0;
        let inString = false;
        let escape = false;
        let i = arrayStart;
        for (; i < rscPayload.length; i++) {
            const c = rscPayload[i];
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
                        return JSON.parse(rscPayload.slice(arrayStart, i + 1)) as OriginalPost[];
                    }
                }
            }
        }

        searchStart = arrayStart + 1;
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

    const html = await ofetch<string>('https://forwardfuture.com/originals');

    const pushRegex = /__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
    let match: RegExpExecArray | null;
    let posts: OriginalPost[] = [];

    while ((match = pushRegex.exec(html)) !== null) {
        const payload = match[1];
        if (!payload.includes('posts')) {
            continue;
        }

        const decoded = JSON.parse(`"${payload}"`);
        const extracted = extractPostsArray(decoded);
        if (extracted) {
            posts = extracted;
            break;
        }
    }

    if (posts.length === 0) {
        throw new Error('Failed to extract posts from the Next.js RSC payload');
    }

    const items: DataItem[] = posts.slice(0, limit).map((post) => ({
        title: post.title,
        description: post.summary || undefined,
        link: post.url,
        pubDate: parseDate(post.dateUnix, 'X'),
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
