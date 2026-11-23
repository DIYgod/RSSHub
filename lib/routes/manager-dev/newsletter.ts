import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const rootUrl = 'https://www.manager.dev';
const listUrl = `${rootUrl}/newsletter`;

const sortTitles = {
    'most-read': 'Most read',
    newest: 'Newest',
} as const;

type Sort = keyof typeof sortTitles;

interface Post {
    slug: string;
    title: string;
    subtitle?: string;
    thumbnailUrl?: string;
    publishDate: string;
    authors?: Array<{ name: string }>;
    tags?: string[];
    readers?: number;
}

export const route: Route = {
    path: '/newsletter/:sort?',
    name: 'Newsletter',
    url: 'www.manager.dev/newsletter',
    example: '/manager-dev/newsletter',
    parameters: {
        sort: {
            description: 'Sort order, same as the tabs on the newsletter page',
            default: 'most-read',
            options: [
                { value: 'most-read', label: 'Most read' },
                { value: 'newest', label: 'Newest' },
            ],
        },
    },
    description: 'Full-text posts from the Manager.dev newsletter, either the most-read posts of all time (by view count) or the newest posts. Sponsor blocks are removed.',
    categories: ['blog'],
    maintainers: ['Rjnishant530'],
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
            source: ['www.manager.dev/newsletter'],
            target: '/newsletter',
        },
    ],
    view: ViewType.Articles,
    handler,
};

// The newsletter page streams every post through the Next.js flight data (`self.__next_f.push`).
function extractPosts(html: string): Post[] {
    const stream = Array.from(html.matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g), (match) => JSON.parse(match[1]) as string).join('');
    const start = stream.indexOf('{"posts":[');
    if (start === -1) {
        throw new Error('Unable to find the post list on the Manager.dev newsletter page.');
    }
    const lineStart = stream.lastIndexOf('\n', start) + 1;
    const lineEnd = stream.indexOf('\n', start);
    const line = stream.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const element = JSON.parse(line.slice(line.indexOf(':') + 1)) as [string, string, null, { posts: Post[] }];
    return element[3].posts;
}

// Dates in the flight data are ISO strings prefixed with `$D`.
const publishedAt = (post: Post) => Temporal.Instant.from(post.publishDate.replace(/^\$D/, ''));

function cleanBody(html: string, link: string) {
    const $ = load(html);
    const body = $('#post-body');
    if (body.length === 0) {
        return;
    }

    // Sponsored intro: the callout plus the divider that follows it.
    body.find('.sponsor-block').each((_, element) => {
        const next = $(element).next();
        if (next.find('hr').length > 0 && next.find('img').length === 0 && next.text() === '') {
            next.remove();
        }
        $(element).remove();
    });

    body.find('a[href]').each((_, element) => {
        const url = URL.parse($(element).attr('href')!, link);
        if (!url) {
            return;
        }

        if (url.searchParams.get('sid') === '{{api_subscription_id}}') {
            url.searchParams.delete('sid');
        }
        $(element).attr('href', url.href);
    });

    return body.html();
}

async function handler(ctx: Context): Promise<Data> {
    const sort = (ctx.req.param('sort') ?? 'most-read') as Sort;
    if (!Object.hasOwn(sortTitles, sort)) {
        throw new InvalidParameterError(`Invalid sort: ${sort}. Use one of ${Object.keys(sortTitles).join(', ')}.`);
    }

    const html = await ofetch<string>(listUrl, { parseResponse: (text) => text });
    const posts = extractPosts(html);

    const sorted = sort === 'newest' ? posts.toSorted((a, b) => Temporal.Instant.compare(publishedAt(b), publishedAt(a))) : posts.toSorted((a, b) => (b.readers ?? 0) - (a.readers ?? 0));

    const list: DataItem[] = sorted.map((post) => {
        const authors = post.authors?.map((author) => author.name).filter(Boolean);
        return {
            title: post.title,
            link: `${listUrl}/${post.slug}`,
            description: post.subtitle,
            pubDate: parseDate(post.publishDate.replace(/^\$D/, '')),
            author: authors?.length ? authors.join(', ') : undefined,
            category: post.tags,
            image: post.thumbnailUrl,
        };
    });

    const items = await pMap(
        list.slice(0, getRouteLimit(ctx, 20)),
        async (item) => {
            try {
                return await cache.tryGet(item.link!, async () => {
                    const page = await ofetch<string>(item.link!, { parseResponse: (text) => text });
                    return {
                        ...item,
                        description: cleanBody(page, item.link!) ?? item.description,
                    };
                });
            } catch (error) {
                if ((error as { response?: { status?: number } }).response?.status === 404) {
                    logger.warn(`Manager.dev post not found, keeping the summary: ${item.link}`);
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 5 }
    );

    return {
        title: `Manager.dev Newsletter - ${sortTitles[sort]}`,
        link: listUrl,
        description: 'The Manager.dev newsletter: weekly insights for engineering managers.',
        image: `${rootUrl}/social.png`,
        language: 'en',
        item: items,
    };
}
