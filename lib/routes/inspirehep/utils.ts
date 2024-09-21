import { LiteratureResponse } from './types';
import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'https://inspirehep.net';

export const parseLiterature = (hits: LiteratureResponse['hits']['hits']) =>
    hits.map((item) => ({
        title: item.metadata.titles.map((t) => t.title).join(' '),
        link: `${baseUrl}/literature/${item.id}`,
        description: item.metadata.abstracts?.map((a) => `<span>${a.value}</span>`).join('<br>'),
        pubDate: parseDate(item.created),
        updated: parseDate(item.updated),
        category: item.metadata.keywords?.map((k) => k.value),
        author: item.metadata.authors.map((a) => `${a.first_name} ${a.last_name}${a.affiliations ? ` (${a.affiliations.map((aff) => aff.value).join(', ')})` : ''}`).join(', '),
    }));
