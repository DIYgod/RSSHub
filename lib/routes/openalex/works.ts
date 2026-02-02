import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://api.openalex.org';

// Reconstruct abstract from inverted index
const reconstructAbstract = (invertedIndex: Record<string, number[]>): string => {
    if (!invertedIndex) {
        return '';
    }

    const words: string[] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
        for (const pos of positions) {
            words[pos] = word;
        }
    }

    return words.filter(Boolean).join(' ');
};

// Map filter types to their API field names
const filterTypeMap = {
    subfield: 'primary_topic.subfield.id',
    topic: 'primary_topic.id',
    field: 'primary_topic.field.id',
    domain: 'primary_topic.domain.id',
};

export const handler = async (ctx) => {
    const { journals, type, ids } = ctx.req.param();

    // Get date 14 days ago (2 weeks)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];

    // Build filter parameters
    const filters = [`publication_date:>${twoWeeksAgoStr}`, 'has_abstract:true', `primary_location.source.id:${journals}`];

    // Add type filter if provided
    if (type && ids) {
        if (!filterTypeMap[type]) {
            throw new Error(`Invalid type: ${type}. Must be one of: ${Object.keys(filterTypeMap).join(', ')}`);
        }
        const typeField = filterTypeMap[type];
        filters.push(`${typeField}:${ids}`);
    }

    const filter = filters.join(',');

    const apiUrl = `${rootUrl}/works`;
    const response = await ofetch(apiUrl, {
        query: {
            filter,
            sort: 'publication_date:desc',
            'per-page': 100,
        },
    });

    const items = response.results.map((work) => {
        const doi = work.doi || work.id;
        const cacheKey = `${doi}-${work.updated_date}`;

        const abstract = reconstructAbstract(work.abstract_inverted_index);
        const authors = work.authorships?.map((a) => a.author.display_name).join(', ') || '';
        const doiUrl = work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : work.id;

        const pubDate = work.publication_date ? new Date(work.publication_date) : undefined;

        return {
            title: work.title || 'Untitled',
            link: doiUrl,
            description: abstract,
            author: authors,
            pubDate,
            guid: cacheKey,
            category: work.primary_topic?.subfield?.display_name ? [work.primary_topic.subfield.display_name] : [],
        };
    });

    // Get journal and filter type names for title
    const journalIdArray = journals.split('|');

    let feedTitle = 'OpenAlex Works';
    try {
        // Get all journal names
        const journalNames = await Promise.all(journalIdArray.map((id) => getJournalName(id)));
        const journalPart = journalNames.join(', ');

        // Build title with optional filter part
        if (type && ids) {
            const filterIdArray = ids.split('|');
            // Get up to 3 filter names, then show "Compiled" if more
            let filterPart;
            if (filterIdArray.length <= 3) {
                const filterNames = await Promise.all(filterIdArray.map((id) => getFilterName(type, id)));
                filterPart = filterNames.join(', ');
            } else {
                filterPart = 'Compiled';
            }
            feedTitle = `OpenAlex: ${journalPart} | ${filterPart}`;
        } else {
            feedTitle = `OpenAlex: ${journalPart}`;
        }
    } catch {
        // Fallback to default title
    }

    const description = type && ids ? `Recent publications from OpenAlex filtered by ${type} (last 2 weeks)` : 'Recent publications from OpenAlex (last 2 weeks)';

    return {
        title: feedTitle,
        link: 'https://openalex.org',
        description,
        item: items,
    };
};

// Helper functions to get names (cached)
async function getJournalName(journalId: string): Promise<string> {
    return await cache.tryGet(`openalex:journal:${journalId}`, async () => {
        try {
            const response = await ofetch(`${rootUrl}/sources/${journalId}`);
            return response.display_name || journalId;
        } catch {
            return journalId;
        }
    });
}

async function getFilterName(type: string, id: string): Promise<string> {
    return await cache.tryGet(`openalex:${type}:${id}`, async () => {
        try {
            const endpoint = type === 'subfield' ? 'subfields' : type === 'topic' ? 'topics' : type === 'field' ? 'fields' : 'domains';
            const response = await ofetch(`${rootUrl}/${endpoint}/${id}`);
            return response.display_name || id;
        } catch {
            return id;
        }
    });
}

export const route: Route = {
    path: '/:journals/:type?/:ids?',
    name: 'Works',
    url: 'openalex.org',
    maintainers: ['emdoe'],
    handler,
    example: '/openalex/s64187185/subfield/2604',
    parameters: {
        journals: 'Pipe-separated journal source IDs (e.g., s64187185|s123456789)',
        type: 'Optional filter type: subfield, topic, field, or domain',
        ids: 'Optional pipe-separated filter IDs matching the type (e.g., 2604|2605 for subfields)',
    },
    description: `Get recent scientific publications from OpenAlex filtered by journal and optionally by topic classification (last 2 weeks).

Examples:
- /openalex/s64187185 - All works from a journal (no topic filter)
- /openalex/s64187185/subfield/2604 - Filter by subfield
- /openalex/s64187185|s123456/topic/T10001|T10002 - Filter by topic with multiple journals
- /openalex/s64187185/field/19 - Filter by field
- /openalex/s64187185/domain/1 - Filter by domain`,
    categories: ['journal'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['openalex.org/works'],
            target: '/:journals/:type?/:ids?',
        },
    ],
};
