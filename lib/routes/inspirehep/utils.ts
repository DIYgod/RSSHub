import { parseDate } from '@/utils/parse-date';

import type { LiteratureResponse } from './types';

export const baseUrl = 'https://inspirehep.net';

export const parseLiterature = (hits: LiteratureResponse['hits']['hits']) =>
    hits.map((item) => ({
        title: item.metadata.titles.map((t) => t.title).join(' '),
        link: `${baseUrl}/literature/${item.id}`,
        description: item.metadata.abstracts?.map((a) => `<span>${a.value}</span>`).join('<br>'),
        pubDate: parseDate(item.created),
        updated: parseDate(item.updated),
        category: item.metadata.keywords?.map((k) => k.value),
        author: item.metadata.authors?.map((a) => `${a.full_name || [a.first_name, a.last_name].filter(Boolean).join(' ')}${a.affiliations ? ` (${a.affiliations.map((aff) => aff.value).join(', ')})` : ''}`).join(', '),
    }));
