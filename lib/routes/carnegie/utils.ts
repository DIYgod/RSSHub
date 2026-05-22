import type { Data } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://carnegieendowment.org';
const apiUrl = 'https://search.carnegieendowment.org/multi_search';
const apiKey = 'QEjXNZ4UyqmmNcL0PFQNphVvw482gb3J';

type CarnegieFilterType = 'topics' | 'regions';

interface CarnegieFeedOptions {
    filterType: CarnegieFilterType;
    slug: string;
    title: string;
    description: string;
    link: string;
    limit?: number;
}

export async function getCarnegieFeed({ filterType, slug, title, description, link, limit = 25 }: CarnegieFeedOptions): Promise<Data> {
    const { data: response } = await got.post(apiUrl, {
        json: {
            searches: [
                {
                    collection: 'content_en',
                    q: '*',
                    query_by: '*',
                    sort_by: 'contentSummary.publishedAt:desc',
                    per_page: limit,
                    filter_by: `${filterType}.slug:=${slug}`,
                },
            ],
        },
        headers: {
            'x-typesense-api-key': apiKey,
        },
    });

    const hits = response.results?.[0]?.hits ?? [];

    return {
        title,
        link,
        description,
        item: hits.map(({ document }) => {
            const summary = document.contentSummary ?? {};
            const itemLink = summary.href?.startsWith('http') ? summary.href : `${rootUrl}${summary.href}`;
            const image = document.image?.url;

            return {
                title: summary.title,
                link: itemLink,
                guid: document.id,
                description: [summary.descriptionRichText ?? '', image ? `<p><img src="${image}" referrerpolicy="no-referrer"></p>` : ''].join(''),
                pubDate: summary.publishedAt ? parseDate(summary.publishedAt) : undefined,
                author: getAuthor(document),
                category: [...getTitles(document.topics), ...getTitles(document.regions)],
            };
        }),
    };
}

function getAuthor(document) {
    return getTitles(document.contributors).join(', ') || Object.values(document.expertsByCenter ?? {}).join(', ');
}

function getTitles(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items.map((item) => item.title).filter(Boolean);
}

export { rootUrl };
