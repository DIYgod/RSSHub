import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

import { filterEvents } from './eventapi';

export const route: Route = {
    path: '/repo_event/:owner/:repo/:types?',
    categories: ['programming'],
    example: '/github/repo_event/DIYgod/RSSHub',
    view: ViewType.Notifications,
    parameters: {
        owner: 'Username or organization name',
        repo: 'Repository name',
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
                description: 'GitHub access token to access private repository events',
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
            source: ['github.com/:owner/:repo'],
            target: '/repo_event/:owner/:repo',
        },
    ],
    name: 'Repository Event',
    maintainers: ['mslxl'],
    handler,
};

async function handler(ctx) {
    const owner = ctx.req.param('owner');
    const repo = ctx.req.param('repo');
    const types = ctx.req.param('types') || 'all';

    const isAuthenticated = config.github && config.github.access_token;

    const headers: Record<string, string> = {};
    if (isAuthenticated) {
        headers.Authorization = `token ${config.github.access_token}`;
    }

    const response = await got({
        method: 'get',
        url: `https://api.github.com/repos/${owner}/${repo}/events`,
        headers,
        searchParams: {
            per_page: 100,
        },
    });

    const items = filterEvents(types, response.data);
    const typeFilter = types === 'all' ? 'All Events' : `Events: ${types}`;

    return {
        title: `${owner}/${repo} GitHub Repo Feed - ${typeFilter}`,
        link: `https://github.com/${owner}/${repo}`,
        description: `GitHub events received by ${owner}/${repo}${types === 'all' ? '' : ` (filtered: ${types})`}${isAuthenticated ? ' - includes private events' : ' - public events only'}`,
        item: items,
    };
}
