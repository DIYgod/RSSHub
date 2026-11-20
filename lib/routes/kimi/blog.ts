import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { renderArticleDescription, renderFallbackDescription } from './templates/description';
import type { EntrySourceKind, ParsedBlogEntry } from './utils';
import { BLOG_LIST_URL, DEFAULT_LIMIT, DETAIL_CONCURRENCY, extractBlogEntries, hydrateNextSuspenseSlots, MAX_LIMIT, normalizeContentContainer, SITE_URL } from './utils';

const EXTERNAL_SCRAPE_KINDS = new Set<EntrySourceKind>(['github', 'huggingface', 'github-pages']);

const extractKimiDetail = (html: string, link: string) => {
    const $ = load(html);
    hydrateNextSuspenseSlots($);

    const h1Text = $('main h1').first().text();
    const title = h1Text || undefined;

    const $section = $('main section.pb-20').first();
    const $target = $section.length > 0 ? $section : $('main').first();
    const content = normalizeContentContainer($target, $, link);

    return {
        title,
        ...content,
    };
};

const extractExternalDetail = (html: string, entry: ParsedBlogEntry) => {
    const $ = load(html);
    const metaSummary = $('meta[name="description"]').attr('content')?.trim() || $('meta[property="og:description"]').attr('content')?.trim();

    if (entry.kind === 'github') {
        const content = normalizeContentContainer($('article.markdown-body').first(), $, entry.link);
        return { ...content, metaSummary };
    }

    if (entry.kind === 'huggingface') {
        const content = normalizeContentContainer($('main .prose').first(), $, entry.link);
        return { ...content, metaSummary };
    }

    if (entry.kind === 'github-pages') {
        const content = normalizeContentContainer($('body').first(), $, entry.link);
        return { ...content, metaSummary };
    }

    return { bodyHtml: '', hasContent: false, metaSummary };
};

const fetchInternalEntry = async (entry: ParsedBlogEntry): Promise<DataItem> => {
    const html = await ofetch<string>(entry.link);
    const { title: detailTitle, bodyHtml, hasContent } = extractKimiDetail(html, entry.link);
    const description = hasContent ? renderArticleDescription(bodyHtml, entry.image) : renderFallbackDescription(entry.summary, entry.image);

    return {
        title: detailTitle || entry.title,
        link: entry.link,
        description,
        pubDate: entry.pubDate,
        author: 'Kimi',
        image: entry.image,
    };
};

const buildExternalFallbackItem = (entry: ParsedBlogEntry, metaSummary?: string): DataItem => ({
    title: entry.title,
    link: entry.link,
    description: renderFallbackDescription(entry.summary || metaSummary, entry.image),
    pubDate: entry.pubDate,
    author: 'Kimi',
    image: entry.image,
});

const fetchExternalEntry = async (entry: ParsedBlogEntry): Promise<DataItem> => {
    const html = await ofetch<string>(entry.link);
    const { bodyHtml, hasContent, metaSummary } = extractExternalDetail(html, entry);
    if (!hasContent) {
        return buildExternalFallbackItem(entry, metaSummary);
    }

    return {
        title: entry.title,
        link: entry.link,
        description: renderArticleDescription(bodyHtml, entry.image),
        pubDate: entry.pubDate,
        author: 'Kimi',
        image: entry.image,
    };
};

const fetchBlogItem = async (entry: ParsedBlogEntry): Promise<DataItem> => {
    if (entry.kind === 'kimi') {
        return await cache.tryGet<DataItem>(`kimi:blog:${entry.link}`, () => fetchInternalEntry(entry));
    }
    if (EXTERNAL_SCRAPE_KINDS.has(entry.kind)) {
        try {
            return await cache.tryGet<DataItem>(`kimi:blog:${entry.link}`, () => fetchExternalEntry(entry));
        } catch {
            // Do not cache transient external fetch failures inside cache.tryGet
        }
    }
    return buildExternalFallbackItem(entry);
};

async function handler(ctx: Context): Promise<Data> {
    const html = await ofetch<string>(BLOG_LIST_URL);
    const entries = extractBlogEntries(html);
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const selected = entries.slice(0, limit);

    const items = await pMap(selected, (entry) => fetchBlogItem(entry), {
        concurrency: DETAIL_CONCURRENCY,
    });

    return {
        title: 'Kimi Research Blog',
        description: 'Our research seeks the optimal conversion from energy into intelligence.',
        link: `${SITE_URL}/en/blog/`,
        language: 'en',
        item: items,
    };
}

export const route: Route = {
    path: '/blog',
    name: 'Research Blog',
    url: 'kimi.com/en/blog',
    example: '/kimi/blog',
    categories: ['programming'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    description: 'Full-text research blog posts and open-source releases from Kimi (`kimi.com/en/blog`). Fetches up to 20 entries by default; supports the common `limit` query parameter.',
    zh: {
        name: '研究博客',
        description: '获取 Kimi（月之暗面）官方研究博客与开源模型发布全文（对应 `kimi.com/en/blog`），默认获取最多 20 篇，支持通用 `limit` 参数。',
    },
    radar: [
        {
            source: ['www.kimi.com/blog', 'www.kimi.com/en/blog', 'www.kimi.com/blog/:slug', 'www.kimi.com/en/blog/:slug'],
            target: '/blog',
        },
        {
            source: ['kimi.com/blog', 'kimi.com/en/blog', 'kimi.com/blog/:slug', 'kimi.com/en/blog/:slug'],
            target: '/blog',
        },
        {
            source: ['www.kimi.ai/blog', 'www.kimi.ai/zh-hans/blog', 'www.kimi.ai/blog/:slug', 'www.kimi.ai/zh-hans/blog/:slug'],
            target: '/blog',
        },
        {
            source: ['kimi.ai/blog', 'kimi.ai/zh-hans/blog', 'kimi.ai/blog/:slug', 'kimi.ai/zh-hans/blog/:slug'],
            target: '/blog',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    handler,
};
