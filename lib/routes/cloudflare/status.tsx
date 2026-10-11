import { load } from 'cheerio';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import MarkdownIt from 'markdown-it';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface IncidentUpdate {
    status: string;
    body: string;
    display_at: string;
}

interface Incident {
    id: string;
    name: string;
    incident_updates: IncidentUpdate[];
}

interface StatusResponse {
    page: { name: string };
    incidents: Incident[];
    scheduled_maintenances: Incident[];
}

const baseUrl = 'https://www.cloudflarestatus.com';
const md = MarkdownIt({ html: true, linkify: true });

function createItem(incident: Incident, update: IncidentUpdate, index: number) {
    const previousUpdate = incident.incident_updates[index + 1];
    const type = update.status === 'scheduled' && incident.incident_updates.length === 1 ? '' : update.status === previousUpdate?.status ? 'Update' : update.status.replaceAll('_', ' ').replace(/^./, (char) => char.toUpperCase());
    const body = md.renderInline(update.body.replaceAll(/\r?\n/g, '<br>'));
    const text = load(body, null, false).text();
    // Statuspage's HTML timestamps use second precision; preserve existing GUIDs.
    const timestamp = Math.floor(parseDate(update.display_at).getTime() / 1000) * 1000;
    const pubDate = parseDate(timestamp, 'x');
    const link = `${baseUrl}/incidents/${incident.id}`;
    const guid = `${link}#${timestamp}`;
    const description = renderToString(
        <>
            <h2>{incident.name}</h2>
            {type ? (
                <>
                    <strong>{type}</strong>
                    {' - '}
                </>
            ) : null}
            <span class="whitespace-pre-wrap">{raw(body)}</span>
            <br />
            <small>
                <span class="ago" data-datetime-unix={timestamp} />
                {pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                {' - '}
                {pubDate.toISOString().slice(11, 16)} UTC
            </small>
        </>
    );

    return {
        title: `${type ? `${type} - ` : ''}${text}`,
        description,
        pubDate,
        link,
        category: type ? [type] : [],
        guid,
        id: guid,
        content: { html: description, text: description },
        updated: pubDate,
        language: 'en',
    } satisfies DataItem;
}

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = Number(ctx.req.query('limit') ?? '100');
    const response = await ofetch<StatusResponse>(`${baseUrl}/api/v2/summary.json`, {
        headers: { 'User-Agent': config.trueUA },
    });
    const items = [...response.incidents, ...response.scheduled_maintenances]
        .flatMap((incident) => incident.incident_updates.map((update, index) => createItem(incident, update, index)))
        .toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
        .slice(0, limit);

    return {
        title: response.page.name,
        description: 'Real-time status and incident history for Cloudflare services, network locations, and scheduled maintenance.',
        link: baseUrl,
        item: items,
        allowEmpty: true,
        language: 'en',
        id: baseUrl,
    };
};

export const route: Route = {
    path: '/status',
    name: 'Status',
    url: 'www.cloudflarestatus.com',
    maintainers: ['nczitzk', 'ljh12138164'],
    handler,
    example: '/cloudflare/status',
    parameters: undefined,
    description:
        'Uses the [official API](https://www.cloudflarestatus.com/api) to provide each update for ongoing incidents and upcoming or active maintenance from [Cloudflare Status](https://www.cloudflarestatus.com/) as a separate item. The legacy route `/cloudflarestatus` redirects here.',
    zh: {
        description:
            '来源：[Cloudflare Status](https://www.cloudflarestatus.com/)。使用[官方 API](https://www.cloudflarestatus.com/api)获取未解决故障及计划中、进行中的维护通知，每次更新单独生成一条订阅内容。旧路由 `/cloudflarestatus` 会重定向到此路由。',
    },
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
            target: '/status',
        },
    ],
    view: ViewType.Notifications,
};
