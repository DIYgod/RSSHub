import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

import { filterEvents } from './eventapi';

export const route: Route = {
    path: '/org_event/:org/:types?',
    categories: ['programming'],
    example: '/github/org_event/RSSNext',
    view: ViewType.Notifications,
    parameters: {
        org: 'Organization name',
        types: {
            description: 'Event types to include, comma separated',
            default: 'all',
            options: [
                {
                    label: 'All events',
                    value: 'all',
                },
                {
                    label: 'Create events',
                    value: 'create',
                },
                {
                    label: 'Delete events',
                    value: 'delete',
                },
                {
                    label: 'Fork events',
                    value: 'fork',
                },
                {
                    label: 'Issue create events',
                    value: 'issue',
                },
                {
                    label: 'Issue comment events',
                    value: 'issuecomm',
                },
                {
                    label: 'Member events',
                    value: 'member',
                },
                {
                    label: 'Pull request events',
                    value: 'pr',
                },
                {
                    label: 'Pull request review comment events',
                    value: 'prcomm',
                },
                {
                    label: 'Pull request review events',
                    value: 'prrev',
                },
                {
                    label: 'Public events',
                    value: 'public',
                },
                {
                    label: 'Push events',
                    value: 'push',
                },
                {
                    label: 'Release events',
                    value: 'release',
                },
                {
                    label: 'Watch events (stars)',
                    value: 'star',
                },
                {
                    label: 'Wiki item create or update events',
                    value: 'wiki',
                },
                {
                    label: 'Commit comment events',
                    value: 'cmcomm',
                },
                {
                    label: 'Discussion events',
                    value: 'discussion',
                },
            ],
        },
    },
    features: {
        requireConfig: [
            {
                name: 'GITHUB_ACCESS_TOKEN',
                optional: true,
                description: 'GitHub access token to avoid access limit',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['github.com/orgs/:org'],
            target: '/org_event/:org',
        },
    ],
    name: 'Organization Event',
    maintainers: ['mslxl'],
    handler,
};

async function handler(ctx) {
    const org = ctx.req.param('org');
    const types = ctx.req.param('types') || 'all';

    const isAuthenticated = config.github && config.github.access_token;

    const headers: Record<string, string> = {};
    if (isAuthenticated) {
        headers.Authorization = `token ${config.github.access_token}`;
    }

    const response = await got({
        method: 'get',
        url: `https://api.github.com/orgs/${org}/events`,
        headers,
        searchParams: {
            per_page: 100,
        },
    });

    const items = filterEvents(types, response.data);
    const typeFilter = types === 'all' ? 'All Events' : `Events: ${types}`;

    return {
        title: `${org} GitHub organization Feed - ${typeFilter}`,
        link: `https://github.com/${org}`,
        description: `GitHub events received by ${org}`,
        item: items,
    };
}
