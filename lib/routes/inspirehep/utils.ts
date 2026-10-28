import { parseDate } from '@/utils/parse-date';

import type { LiteratureResponse } from './types';

export const baseUrl = 'https://inspirehep.net';

export const parseRecordDate = (value?: string) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(value) || !Number.isFinite(parseDate(value.slice(0, 10), 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
};

export const parseLiterature = (hits: LiteratureResponse['hits']['hits']) =>
    hits.map((item) => ({
        title: item.metadata.titles.map((t) => t.title).join(' '),
        link: `${baseUrl}/literature/${item.id}`,
        description: item.metadata.abstracts?.map((a) => `<span>${a.value}</span>`).join('<br>'),
        pubDate: parseRecordDate(item.created),
        updated: parseRecordDate(item.updated),
        category: item.metadata.keywords?.map((k) => k.value),
        author: item.metadata.authors?.map((a) => `${a.full_name || [a.first_name, a.last_name].filter(Boolean).join(' ')}${a.affiliations ? ` (${a.affiliations.map((aff) => aff.value).join(', ')})` : ''}`).join(', '),
    }));
