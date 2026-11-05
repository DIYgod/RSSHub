import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

interface IncidentUpdate {
    id: string;
    status: string;
    body: string;
    display_at: string;
    created_at: string;
    updated_at: string;
}

interface Incident {
    id: string;
    name: string;
    shortlink: string;
    incident_updates: IncidentUpdate[];
}

interface StatusResponse {
    page: { name: string; url: string };
    incidents: Incident[];
}

interface MaintenanceResponse {
    scheduled_maintenances: Incident[];
}

const baseUrl = 'https://www.cloudflarestatus.com';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 100);
    const [incidents, maintenances] = await Promise.all([ofetch<StatusResponse>(`${baseUrl}/api/v2/incidents.json`), ofetch<MaintenanceResponse>(`${baseUrl}/api/v2/scheduled-maintenances.json`)]);

    const items = [...incidents.incidents, ...maintenances.scheduled_maintenances].flatMap((incident) =>
        incident.incident_updates.map((update) => {
            const status = update.status.replaceAll('_', ' ');
            const type = status.charAt(0).toUpperCase() + status.slice(1);
            const description = renderToString(<p style={{ whiteSpace: 'pre-line' }}>{update.body}</p>);

            return {
                title: `${type} - ${incident.name}`,
                description,
                pubDate: parseDate(update.display_at ?? update.created_at),
                updated: parseDate(update.updated_at),
                link: incident.shortlink,
                category: [type],
                guid: update.id,
                id: update.id,
                content: { html: description, text: update.body },
                language: 'en' as const,
            };
        })
    );

    if (ctx.req.query('sorted') !== 'false') {
        items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    }

    return {
        title: incidents.page.name,
        description: 'Real-time status and incident history for Cloudflare services, network locations, and scheduled maintenance.',
        link: incidents.page.url,
        item: items.slice(0, limit),
        allowEmpty: true,
        language: 'en',
        id: baseUrl,
    };
};

export const route: Route = {
    path: '/',
    name: 'Status',
    url: 'www.cloudflarestatus.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/cloudflarestatus',
    parameters: undefined,
    description: undefined,
    categories: ['programming'],
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
            source: ['www.cloudflarestatus.com'],
            target: '/',
        },
    ],
    view: ViewType.Notifications,
};
