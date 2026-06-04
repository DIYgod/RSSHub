import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

import { filterEvents } from './eventapi';

export const route: Route = {
    path: '/feed/:user/:types?',
    categories: ['programming'],
    example: '/github/feed/yihong0618/star,release,pr',
    view: ViewType.Notifications,
    parameters: {
        user: 'GitHub username',
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
            ],
        },
    },
    features: {
        requireConfig: [
            {
                name: 'GITHUB_ACCESS_TOKEN',
                optional: true,
                description: 'GitHub access token to access private events',
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
            source: ['github.com/:user'],
            target: '/feed/:user',
        },
    ],
    name: "User's Feed",
    maintainers: ['RtYkk'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');
    const types = ctx.req.param('types') || 'all';

    const isAuthenticated = config.github && config.github.access_token;

    const headers: Record<string, string> = {};
    if (isAuthenticated) {
        headers.Authorization = `token ${config.github.access_token}`;
    }

    const response = await got({
        method: 'get',
        url: `https://api.github.com/users/${user}/received_events`,
        headers,
        searchParams: {
            per_page: 100,
        },
    });

    const items = filterEvents(types, response.data);

    const typeFilter = types === 'all' ? 'All Events' : `Events: ${types}`;
    const feedType = isAuthenticated ? 'Private Feed' : 'Public Feed';

    return {
        title: `${user}'s GitHub ${feedType} - ${typeFilter}`,
        link: `https://github.com/${user}`,
        description: `GitHub events received by ${user}${types === 'all' ? '' : ` (filtered: ${types})`}${isAuthenticated ? ' - includes private events' : ' - public events only'}`,
        item: items,
    };
}
