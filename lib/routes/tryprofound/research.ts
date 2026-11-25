import type { Context } from 'hono';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import logger from '@/utils/logger';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import type { ResearchArticle } from './utils';
import { fetchArticleContent, fetchResearchArticles, renderImage, researchUrl, rootUrl } from './utils';

const DEFAULT_LIMIT = 20;
const DETAIL_CONCURRENCY = 5;
const blogPrefix = `${rootUrl}/blog/`;

const filterOptions = [
    { value: 'all', label: 'All Research' },
    { value: 'answer-engines', label: 'Answer Engines' },
    { value: 'industry-verticals', label: 'Industry Verticals' },
    { value: 'personal-agents', label: 'Personal Agents' },
];

const resolveLink = (article: ResearchArticle): string | undefined => {
    const path = article.href ?? article.url ?? (article.slug ? `/blog/${article.slug}` : undefined);
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

const toDataItem = async (article: ResearchArticle, link: string): Promise<DataItem> => {
    const authors = (article.authors ?? []).map((author) => author.fullName).filter(Boolean);
    const coverImage = article.coverImage ? renderImage(article.coverImage, article.title) : '';
    return {
        title: article.title,
        link,
        description: coverImage + ((link.startsWith(blogPrefix) ? await fetchFullText(link) : undefined) ?? ''),
        pubDate: article.publicationDate ? parseDate(article.publicationDate) : undefined,
        author: authors.length > 0 ? authors.join(', ') : undefined,
        category: (article.tags ?? []).map((tag) => tag.label),
        image: article.coverImage,
    };
};

async function handler(ctx: Context): Promise<Data> {
    const rawFilter = ctx.req.param('filter');
    const filter = rawFilter && rawFilter !== 'all' ? rawFilter : undefined;
    const articles = await fetchResearchArticles();

    const filtered = filter ? articles.filter((article) => (article.tags ?? []).some((tag) => tag.slug === filter)) : articles;
    if (filter && filtered.length === 0) {
        const tagSlugs = [...new Set(articles.flatMap((article) => (article.tags ?? []).map((tag) => tag.slug)))];
        throw new InvalidParameterError(`Unknown or empty filter "${filter}". Use one of: all, ${tagSlugs.join(', ')}.`);
    }

    // Links double as GUIDs, so drop entries without a link.
    const entries = filtered.flatMap((article) => {
        const link = resolveLink(article);
        return link ? { article, link } : [];
    });

    const limited = entries.slice(0, getRouteLimit(ctx, DEFAULT_LIMIT));
    const items = await pMap(limited, ({ article, link }) => toDataItem(article, link), { concurrency: DETAIL_CONCURRENCY });

    const filterLabel = filter ? filtered.flatMap((article) => article.tags ?? []).find((tag) => tag.slug === filter)?.label : undefined;

    return {
        title: filterLabel ? `Profound Research - ${filterLabel}` : 'Profound Research',
        link: filter ? `${researchUrl}?filter=${encodeURIComponent(filter)}` : researchUrl,
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
            description: 'Tag slug as used in `https://www.tryprofound.com/research?filter=<slug>` (e.g. `answer-engines`, `industry-verticals`, `personal-agents`). Omit or use `all` for every article.',
            default: 'all',
            options: filterOptions,
        },
    },
    description:
        "Full-text research articles from Profound's Research Hub, fetched from the Profound blog. LinkedIn posts and e-books listed on the hub are not included. Fetches 20 entries by default; supports the common `limit` parameter.",
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
