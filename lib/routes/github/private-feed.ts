import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

const typeMapping: Record<string, string> = {
    push: 'PushEvent',
    issues: 'IssuesEvent',
    pullrequest: 'PullRequestEvent',
    star: 'WatchEvent',
    fork: 'ForkEvent',
    create: 'CreateEvent',
    release: 'ReleaseEvent',
};

export const route: Route = {
    path: '/privatefeed/:user/:types?',
    categories: ['programming'],
    example: '/github/privatefeed/yihong0618/star,release',
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
                    label: 'Fork events',
                    value: 'fork',
                },
                {
                    label: 'Issues events',
                    value: 'issues',
                },
                {
                    label: 'Pull request events',
                    value: 'pullrequest',
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
            target: '/privatefeed/:user',
        },
    ],
    name: 'User\'s Feed',
    maintainers: ['RtYkk'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');
    const types = ctx.req.param('types') || 'all';

    // Setup headers with optional authentication
    const headers: Record<string, string> = {};
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }

    const response = await got({
        method: 'get',
        url: `https://api.github.com/users/${user}/received_events`,
        headers,
        searchParams: {
            per_page: 30,
        },
    });

    // Parse requested event types and map short names to full event types
    let filteredEventTypes: string[] = [];
    if (types !== 'all') {
        filteredEventTypes = types.split(',').map((type) => {
            const trimmedType = type.trim();
            return typeMapping[trimmedType] || trimmedType;
        });
    }

    const items = response.data
        .filter((event) => filteredEventTypes.length === 0 || filteredEventTypes.includes(event.type))
        .map((event) => {
            const { type, actor, repo, payload, created_at } = event;

            let title = '';
            let description = '';
            let link = `https://github.com/${actor.login}`;

            switch (type) {
                case 'PushEvent':
                    title = `${actor.login} pushed to ${repo.name}`;
                    description = `Pushed ${payload.commits?.length || 0} commit(s) to ${repo.name}`;
                    link = `https://github.com/${repo.name}`;
                    if (payload.commits && payload.commits.length > 0) {
                        description += `<br><strong>Latest commit:</strong> ${payload.commits.at(-1).message}`;
                    }
                    break;
                case 'IssuesEvent':
                    title = `${actor.login} ${payload.action} an issue in ${repo.name}`;
                    description = `Issue: ${payload.issue?.title || 'Unknown'}`;
                    link = payload.issue?.html_url || `https://github.com/${repo.name}`;
                    break;
                case 'PullRequestEvent':
                    title = `${actor.login} ${payload.action} a pull request in ${repo.name}`;
                    description = `PR: ${payload.pull_request?.title || 'Unknown'}`;
                    link = payload.pull_request?.html_url || `https://github.com/${repo.name}`;
                    break;
                case 'WatchEvent':
                    title = `${actor.login} starred ${repo.name}`;
                    description = `Starred repository ${repo.name}`;
                    link = `https://github.com/${repo.name}`;
                    break;
                case 'ForkEvent':
                    title = `${actor.login} forked ${repo.name}`;
                    description = `Forked repository ${repo.name}`;
                    link = `https://github.com/${repo.name}`;
                    break;
                case 'CreateEvent':
                    title = `${actor.login} created ${payload.ref_type} in ${repo.name}`;
                    description = `Created ${payload.ref_type}: ${payload.ref || repo.name}`;
                    link = `https://github.com/${repo.name}`;
                    break;
                case 'ReleaseEvent':
                    title = `${actor.login} released ${payload.release?.name || payload.release?.tag_name} in ${repo.name}`;
                    description = payload.release?.body || `Released ${payload.release?.tag_name}`;
                    link = payload.release?.html_url || `https://github.com/${repo.name}`;
                    break;
                default:
                    title = `${actor.login} performed ${type} in ${repo?.name || 'unknown repository'}`;
                    description = `Activity type: ${type}`;
                    link = repo ? `https://github.com/${repo.name}` : `https://github.com/${actor.login}`;
            }

            return {
                title,
                link,
                description,
                pubDate: parseDate(created_at),
                author: actor.login,
                category: [type],
            };
        });

    const typeFilter = types === 'all' ? 'All Events' : `Events: ${types}`;
    const isAuthenticated = config.github && config.github.access_token;
    const feedType = isAuthenticated ? 'Private Feed' : 'Public Feed';

    return {
        title: `${user}'s GitHub ${feedType} - ${typeFilter}`,
        link: `https://github.com/${user}`,
        description: `GitHub events received by ${user}${types === 'all' ? '' : ` (filtered: ${types})`}${isAuthenticated ? ' - includes private events' : ' - public events only'}`,
        item: items,
    };
}
