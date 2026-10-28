import type { Context } from 'hono';
import { FetchError } from 'ofetch';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';

type Category = {
    id: number;
    name: string;
    link: string;
};

type PostsQuery = {
    _embed: string;
    per_page?: string;
    categories?: number;
};

const baseUrl = 'https://www.im2maker.com';
const allowedResourceTypes = new Set(['document', 'xhr', 'fetch']);

function isCertificateTrustError(error: unknown): error is Error {
    return error instanceof Error && (('code' in error && (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY')) || isCertificateTrustError(error.cause));
}

async function fetchJson<T = any>(url: string, query: Record<string, string | number | undefined>, page?: Page): Promise<T> {
    if (!page) {
        return await ofetch<T>(url, { query });
    }
    const target = new URL(url);
    target.search = new URLSearchParams(
        Object.entries(query)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)])
    ).toString();
    return await page.evaluate(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`IM2Maker public API returned HTTP ${response.status}.`);
        }
        return await response.json();
    }, target.href);
}

export const route: Route = {
    path: '/:channel?',
    categories: ['new-media'],
    example: '/im2maker',
    parameters: { channel: '默认不填为 最新文章 ，频道如下' },
    description: `| 最新文章 | 行业快讯 | 行业观察 | 镁客请讲 | 硬科技 100 人 | 投融界   | 万象       |
| -------- | -------- | -------- | -------- | ------------- | -------- | ---------- |
|          | fresh    | industry | talk     | intech        | investor | everything |`,
    name: '频道',
    maintainers: ['jin1218scu'],
    features: {
        requirePuppeteer: true,
    },
    handler,
};

function getGmtDate(value: string | undefined) {
    const date = value ? parseDate(`${value.replace(/Z$/, '')}Z`) : undefined;
    return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

async function handler(ctx: Context) {
    try {
        return await fetchFeed(ctx);
    } catch (error) {
        if (!(error instanceof FetchError) || !isCertificateTrustError(error)) {
            throw error;
        }
    }
    const url = `${baseUrl}/wp-json/wp/v2/posts?_embed=&per_page=10`;
    const { page, destroy } = await getPlaywrightPage(url, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => (allowedResourceTypes.has(route.request().resourceType()) ? route.continue() : route.abort()));
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        if (!response?.ok() || new URL(page.url()).origin !== baseUrl) {
            throw new Error('IM2Maker did not provide its public WordPress API.');
        }
        return await fetchFeed(ctx, page);
    } finally {
        await destroy();
    }
}

async function fetchFeed(ctx: Context, page?: Page) {
    const channel = ctx.req.param('channel')?.toLowerCase();

    let title = '最新文章';
    let link = baseUrl;
    const query: PostsQuery = {
        _embed: '',
        per_page: String(Math.min(getRouteLimit(ctx, 10), 100)),
    };

    if (channel) {
        const category = await cache.tryGet(`im2maker:category:${channel}`, async () => {
            const categories = await fetchJson<Category[]>(`${baseUrl}/wp-json/wp/v2/categories`, { slug: channel }, page);
            if (!Array.isArray(categories)) {
                throw new TypeError('The source did not return its WordPress categories.');
            }
            if (!categories.length) {
                throw new InvalidParameterError(`Unknown channel: ${channel}. Check the channel slug in the route documentation.`);
            }
            return categories[0];
        });
        title = category.name;
        link = category.link;
        query.categories = category.id;
    }

    const posts = await fetchJson(`${baseUrl}/wp-json/wp/v2/posts`, query, page);

    const items = posts.map((post) => ({
        title: post.title.rendered,
        link: post.link,
        guid: post.guid.rendered,
        description: post.content.rendered,
        pubDate: getGmtDate(post.date_gmt),
        author: post._embedded?.author?.[0]?.name,
        category: post._embedded?.['wp:term']?.flat().map((term) => term.name),
    }));

    return {
        title: `镁客网 ${title}`,
        link,
        description: '镁客网',
        item: items,
    };
}
