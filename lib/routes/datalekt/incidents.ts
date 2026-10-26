import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type Incident = {
    date_gmt: string;
    link: string;
    title: { rendered: string };
    content: { rendered: string };
};

export const route: Route = {
    path: '/incidents',
    categories: ['new-media'],
    example: '/datalekt/incidents',
    name: 'Datelekt Incidents',
    maintainers: ['shoeper'],
    description: 'Latest cyber incidents listed by Datalekt',
    radar: [{ source: ['datalekt.nl/incidenten/'], target: '/incidents' }],
    handler,
};

async function handler() {
    const incidents = await ofetch<Incident[]>('https://datalekt.nl/wp-json/wp/v2/incidents?per_page=100');

    return {
        title: 'Datalekt Cyberincidenten',
        link: 'https://datalekt.nl/incidenten/',
        item: incidents.map((incident) => ({
            title: incident.title.rendered,
            link: incident.link,
            pubDate: parseDate(`${incident.date_gmt}Z`),
            description: incident.content.rendered,
        })),
    };
}
