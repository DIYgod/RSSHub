import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { baseUrl } from './utils';

interface CollectionRecord {
    id: string;
    created: string;
    updated: string;
    metadata: {
        position?: string;
        title?: { title: string };
        titles?: Array<{ title: string; subtitle?: string }>;
        ICN?: string[];
        long_name?: string;
        legacy_name?: string;
        journal_title?: { title: string };
        description?: string;
        abstract?: { value: string };
        short_description?: { value: string };
        institutions?: Array<{ value: string }>;
        speakers?: Array<{ name: string }>;
        urls?: Array<{ value: string; description?: string }>;
        deadline_date?: string;
        opening_date?: string;
        closing_date?: string;
        start_datetime?: string;
        end_datetime?: string;
        timezone?: string;
        inspire_categories?: Array<{ term: string }>;
        project_type?: string[];
        institution_type?: string[];
        ranks?: string[];
    };
}

const collectionNames: Record<string, string> = {
    jobs: 'Jobs',
    seminars: 'Seminars',
    conferences: 'Conferences',
    institutions: 'Institutions',
    experiments: 'Experiments',
    journals: 'Journals',
};

export const route: Route = {
    path: '/:collection{jobs|seminars|conferences|institutions|experiments|journals}/:q?',
    name: 'Collection Search',
    categories: ['journal'],
    example: '/inspirehep/jobs',
    parameters: {
        collection: {
            description: 'Collection to subscribe to',
            options: Object.entries(collectionNames).map(([value, label]) => ({ value, label })),
        },
        q: 'Optional search query, using the same syntax as the INSPIRE website',
    },
    maintainers: ['DIYgod'],
    radar: Object.keys(collectionNames).map((collection) => ({
        source: [`inspirehep.net/${collection}`],
        target: `/${collection}`,
    })),
    description:
        "Jobs use the most recent creation date, conferences and seminars use the most recent event date, and other collections use the publisher's search ordering. Journals and institutions feeds contain directory records; use Literature Search to subscribe to their publications.",
    handler,
};

async function handler(ctx) {
    const collection = ctx.req.param('collection');
    const q = ctx.req.param('q');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;
    const sort = collection === 'jobs' ? 'mostrecent' : ['seminars', 'conferences'].includes(collection) ? 'datedesc' : undefined;
    const response = await ofetch<{ hits: { hits: CollectionRecord[] } }>(`${baseUrl}/api/${collection}`, {
        query: { sort, size: limit, page: 1, q },
    });
    const link = new URL(`/${collection}`, baseUrl);
    if (q) {
        link.searchParams.set('q', q);
    }

    return {
        title: `${collectionNames[collection]}${q ? `: ${q}` : ''} - INSPIRE`,
        link: link.href,
        item: response.hits.hits.map((record) => {
            const metadata = record.metadata;
            return {
                title:
                    metadata.position ??
                    metadata.title?.title ??
                    metadata.titles?.map((title) => [title.title, title.subtitle].filter(Boolean).join(': ')).join(' ') ??
                    metadata.ICN?.join(', ') ??
                    metadata.long_name ??
                    metadata.legacy_name ??
                    metadata.journal_title?.title ??
                    `${collectionNames[collection]} ${record.id}`,
                link: `${baseUrl}/${collection}/${record.id}`,
                guid: `${collection}:${record.id}`,
                pubDate: parseDate(record.created),
                updated: parseDate(record.updated),
                author: metadata.speakers?.map((speaker) => speaker.name).join(', '),
                category: metadata.inspire_categories?.map((category) => category.term) ?? metadata.project_type ?? metadata.institution_type ?? metadata.ranks,
                description: renderToString(
                    <>
                        {raw(metadata.description ?? metadata.abstract?.value ?? metadata.short_description?.value ?? '')}
                        {metadata.institutions?.length ? <p>{metadata.institutions.map((institution) => institution.value).join(', ')}</p> : null}
                        {metadata.deadline_date ? <p>Application deadline: {metadata.deadline_date}</p> : null}
                        {metadata.opening_date ? <p>Dates: {[metadata.opening_date, metadata.closing_date].filter(Boolean).join(' – ')}</p> : null}
                        {metadata.start_datetime ? (
                            <p>
                                Time: {[metadata.start_datetime, metadata.end_datetime].filter(Boolean).join(' – ')} {metadata.timezone}
                            </p>
                        ) : null}
                        {metadata.urls?.map((url) => (
                            <p>
                                <a href={url.value}>{url.description ?? url.value}</a>
                            </p>
                        ))}
                    </>
                ),
            };
        }),
    };
}
