import type { Context } from 'hono';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import logger from '@/utils/logger';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { fetchArticleContent, fetchResearchItems, renderImage, renderText, type ResearchItem, researchUrl, rootUrl, typeFilters, typeLabels } from './utils';

const DEFAULT_LIMIT = 20;
const DETAIL_CONCURRENCY = 5;
const blogPrefix = `${rootUrl}/blog/`;

const tagOptions = [
    { value: 'answer-engines', label: 'Answer Engines' },
    { value: 'industry-verticals', label: 'Industry Verticals' },
    { value: 'personal-agents', label: 'Personal Agents' },
];

const filterOptions = [{ value: 'all', label: 'All Research' }, ...[...typeFilters].map(([value, { label }]) => ({ value, label })), ...tagOptions];

const resolveLink = (item: ResearchItem): string | undefined => {
    const path = item._type === 'researchArticle' ? (item.href ?? item.url ?? (item.slug ? `/blog/${item.slug}` : undefined)) : item.href;
    return path ? new URL(path, rootUrl).href : undefined;
};

const fetchFullText = async (link: string): Promise<string | undefined> => {
    try {
        return await fetchArticleContent(link);
    } catch (error) {
        // A research entry may point to a deleted blog post; keep the entry without full text.
        if (error instanceof FetchError && error.status === 404) {
            logger.warn(`tryprofound: blog post not found: ${link}`);
            return undefined;
        }
        throw error;
    }
};

const renderDescription = async (item: ResearchItem, link: string): Promise<string> => {
    const fullText = link.startsWith(blogPrefix) ? await fetchFullText(link) : undefined;
    switch (item._type) {
        case 'researchArticle':
            return (item.coverImage ? renderImage(item.coverImage, item.title) : '') + (fullText ?? '');
        case 'researchSocialPost':
            return fullText ?? renderText(item.excerpt ?? '');
        case 'researchEbook':
            return renderText(item.subtitle ?? '');
        default:
            return '';
    }
};

const toDataItem = async (item: ResearchItem, link: string): Promise<DataItem> => {
    const authors = (item.authors ?? []).map((author) => author.fullName?.trim()).filter(Boolean);
    return {
        title: item.title,
        link,
        description: await renderDescription(item, link),
        pubDate: item.publicationDate ? parseDate(item.publicationDate) : undefined,
        author: authors.length > 0 ? authors.join(', ') : undefined,
        category: [typeLabels[item._type], ...(item.tags ?? []).map((tag) => tag.label)].filter(Boolean),
        image: item._type === 'researchArticle' ? item.coverImage : undefined,
    };
};

const matchesFilter = (item: ResearchItem, filter: string | undefined): boolean => {
    if (!filter) {
        return true;
    }
    const typeFilter = typeFilters.get(filter);
    return typeFilter ? item._type === typeFilter.type : (item.tags ?? []).some((tag) => tag.slug === filter);
};

async function handler(ctx: Context): Promise<Data> {
    const rawFilter = ctx.req.param('filter');
    const filter = rawFilter && rawFilter !== 'all' ? rawFilter : undefined;
    const researchItems = await fetchResearchItems();

    const filtered = researchItems.filter((item) => matchesFilter(item, filter));
    if (filter && filtered.length === 0) {
        const tagSlugs = [...new Set(researchItems.flatMap((item) => (item.tags ?? []).map((tag) => tag.slug)))];
        throw new InvalidParameterError(`Unknown or empty filter "${filter}". Use one of: all, ${[...typeFilters.keys(), ...tagSlugs].join(', ')}.`);
    }

    // Links double as GUIDs, so drop entries without a link and merge duplicates.
    const entries = new Map<string, ResearchItem>();
    for (const item of filtered) {
        const link = resolveLink(item);
        if (!link) {
            continue;
        }
        const existing = entries.get(link);
        // The same blog post can be listed both as a post and as an article; keep the article entry.
        if (!existing || (existing._type !== 'researchArticle' && item._type === 'researchArticle')) {
            entries.set(link, item);
        }
    }

    const limited = [...entries].slice(0, getRouteLimit(ctx, DEFAULT_LIMIT));
    const items = await pMap(limited, ([link, item]) => toDataItem(item, link), { concurrency: DETAIL_CONCURRENCY });

    const tagLabel = filter && !typeFilters.has(filter) ? filtered.flatMap((item) => item.tags ?? []).find((tag) => tag.slug === filter)?.label : undefined;
    const filterLabel = filter ? (typeFilters.get(filter)?.label ?? tagLabel ?? filter) : undefined;

    return {
        title: filterLabel ? `Profound Research - ${filterLabel}` : 'Profound Research',
        // The site only filters by tag through `?filter=`; type values show every item there.
        link: tagLabel ? `${researchUrl}?filter=${encodeURIComponent(filter!)}` : researchUrl,
        description: 'Research, data studies and analysis from the Profound team on AI search and answer engines.',
        language: 'en',
        item: items,
    };
}

export const route: Route = {
    path: '/research/:filter?',
    name: 'Research',
    url: 'www.tryprofound.com/research',
    example: '/tryprofound/research',
    categories: ['new-media'],
    view: ViewType.Articles,
    maintainers: ['Rjnishant530'],
    parameters: {
        filter: {
            description:
                'Filter by content type (`article`, `post`, `ebook`) or by tag slug as used in `https://www.tryprofound.com/research?filter=<slug>` (e.g. `answer-engines`, `industry-verticals`, `personal-agents`). Omit or use `all` for everything.',
            default: 'all',
            options: filterOptions,
        },
    },
    description:
        "Items from Profound's Research Hub. Articles include the full text from the Profound blog; LinkedIn posts use the excerpt shown on the Research Hub and e-books use their subtitle. Fetches 20 entries by default; supports the common `limit` parameter.",
    radar: [
        {
            source: ['www.tryprofound.com/research'],
            target: '/research',
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
