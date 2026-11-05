import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import { FetchError } from 'ofetch';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/community/:community',
    categories: ['social-media'],
    example: '/digg/community/tech',
    parameters: {
        community: 'Current topic slug from the Digg URL, such as tech, ai, gaming, entertainment, world-business, science, or sports',
    },
    description: 'Digg now publishes topic stories instead of the former community posts. Retired communities such as askdigg are unavailable. Only the current first page of published stories is returned.',
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
            source: ['digg.com/:community'],
        },
    ],
    name: 'Topic Stories',
    maintainers: ['TonyRL'],
    handler,
    url: 'digg.com/',
};

type Story = {
    clusterId: string;
    clusterUrlId: string;
    createdAt: string;
    summary: {
        title: string;
        description?: string;
    };
    image?: {
        src: string;
    };
};

type FeedPage = {
    posts: Story[];
};

const baseUrl = 'https://digg.com';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function findFirstPage(value: JsonValue): FeedPage | undefined {
    if (!value || typeof value !== 'object') {
        return;
    }
    if ('initialPage' in value && value.initialPage && typeof value.initialPage === 'object' && 'posts' in value.initialPage && Array.isArray(value.initialPage.posts)) {
        return value.initialPage as FeedPage;
    }
    for (const entry of Object.values(value)) {
        const page = findFirstPage(entry);
        if (page) {
            return page;
        }
    }
}

async function fetchFirstPage(community: string): Promise<FeedPage> {
    try {
        return await ofetch<FeedPage>(`${baseUrl}/api/feed/continuous`, {
            query: {
                topic: community,
                view: 'top',
                range: 'today',
                published: '1',
            },
        });
    } catch (error) {
        if (!(error instanceof FetchError) || error.statusCode !== 429) {
            throw error;
        }
    }

    // The public topic page embeds the same first feed page when the API is rate limited.
    const html = await ofetch<string>(`${baseUrl}/${encodeURIComponent(community)}`);
    const $ = load(html);
    const flight = $('script')
        .toArray()
        .map((script) => {
            const match = $(script)
                .html()
                ?.match(/^self\.__next_f\.push\((\[.*\])\)$/s);
            if (!match) {
                return '';
            }
            const chunk = JSON.parse(match[1]) as unknown[];
            return typeof chunk[1] === 'string' ? chunk[1] : '';
        })
        .join('');
    for (const record of flight.split('\n')) {
        if (!/^[\da-f]+:[{[]/i.test(record)) {
            continue;
        }
        const model = JSON.parse(record.slice(record.indexOf(':') + 1));
        const page = findFirstPage(model);
        if (page) {
            return page;
        }
    }
    throw new Error(`Digg topic "${community}" has no published feed on the current site. Retired communities are unavailable.`);
}

async function handler(ctx: Context): Promise<Data> {
    const community = ctx.req.param('community')!;
    const response = await fetchFirstPage(community);
    if (!Array.isArray(response.posts)) {
        throw new TypeError('Digg did not return its published topic stories. Please check the topic on the original site.');
    }

    const items: DataItem[] = response.posts.map((post) => ({
        title: post.summary.title,
        id: post.clusterId,
        description: post.summary.description ? renderToString(<p>{post.summary.description}</p>) : undefined,
        link: `${baseUrl}/${encodeURIComponent(community)}/${encodeURIComponent(post.clusterUrlId)}`,
        pubDate: post.createdAt ? parseDate(post.createdAt) : undefined,
        author: 'Digg',
        image: post.image?.src,
        category: [community],
    }));
    if (ctx.req.query('sorted') !== 'false') {
        items.sort((a, b) => +new Date(b.pubDate || 0) - +new Date(a.pubDate || 0));
    }

    return {
        title: `${community} | Digg`,
        description: `Published stories from Digg's ${community} topic`,
        link: `${baseUrl}/${encodeURIComponent(community)}`,
        language: 'en',
        item: items.slice(0, getRouteLimit(ctx, 30)),
    };
}
