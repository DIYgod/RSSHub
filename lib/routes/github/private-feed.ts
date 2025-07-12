import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

const typeMapping: Record<string, string> = {
    push: 'PushEvent',
    pr: 'PullRequestEvent',
    prcomm: 'PullRequestReviewCommentEvent',
    issuecomm: 'IssueCommentEvent',
    star: 'WatchEvent',
    fork: 'ForkEvent',
    create: 'CreateEvent',
    delete: 'DeleteEvent',
    release: 'ReleaseEvent',
    public: 'PublicEvent',
    member: 'MemberEvent',
};

export const route: Route = {
    path: '/feed/:user/:types?',
    categories: ['programming'],
    example: '/github/feed/yihong0618/star,release,pr',
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

function formatEventItem(event: any) {
    const { id, type, actor, repo, payload, created_at } = event;

    let title = '';
    let description = '';
    let link = '';

    switch (type) {
        case 'PushEvent': {
            title = `${actor.login} pushed to ${repo.name}`;
            const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'unknown';
            description = `Pushed ${payload.size || 0} commit(s) to ${branch} in ${repo.name}`;
            link = payload.commits.at(-1).url.replace('api.github.com/repos/', 'github.com/').replace('/commits/', '/commit/');
            description += `<br><strong>Latest commit:</strong> ${payload.commits.at(-1).message}`;
            break;
        }
        case 'PullRequestEvent':
            title = `${actor.login} ${payload.action} a pull request in ${repo.name}`;
            description = `PR: ${payload.pull_request?.title || 'Unknown'}`;
            link = payload.pull_request?.html_url || `https://github.com/${repo.name}`;
            break;
        case 'PullRequestReviewCommentEvent':
            title = `${actor.login} commented on a pull request review in ${repo.name}`;
            description = `Comment: ${payload.comment?.body || 'No comment'}`;
            link = payload.comment?.html_url || `https://github.com/${repo.name}`;
            break;
        case 'IssueCommentEvent':
            title = `${actor.login} commented on an issue in ${repo.name}`;
            description = `Comment: ${payload.comment?.body || 'No comment'}`;
            link = payload.comment?.html_url || `https://github.com/${repo.name}`;
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
        case 'DeleteEvent':
            title = `${actor.login} deleted ${payload.ref_type} in ${repo.name}`;
            description = `Deleted ${payload.ref_type}: ${payload.ref}`;
            link = `https://github.com/${repo.name}`;
            break;
        case 'ReleaseEvent':
            title = `${actor.login} released ${payload.release?.name || payload.release?.tag_name} in ${repo.name}`;
            description = payload.release?.body || `Released ${payload.release?.tag_name}`;
            link = payload.release?.html_url || `https://github.com/${repo.name}`;
            break;
        case 'PublicEvent':
            title = `${actor.login} made ${repo.name} public`;
            description = `Repository ${repo.name} was made public`;
            link = `https://github.com/${repo.name}`;
            break;
        case 'MemberEvent':
            title = `${actor.login} ${payload.action} as a member of ${repo.name}`;
            description = `Member ${payload.action} in repository ${repo.name}`;
            link = `https://github.com/${repo.name}`;
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
        guid: id,
    };
}

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

    // Parse requested event types and map short names to full event types
    let filteredEventTypes: string[] = [];
    if (types !== 'all') {
        filteredEventTypes = types.split(',').map((type) => {
            const trimmedType = type.trim();
            return typeMapping[trimmedType] || trimmedType;
        });
    }

    const items = response.data.filter((event) => filteredEventTypes.length === 0 || filteredEventTypes.includes(event.type)).map((event) => formatEventItem(event));

    const typeFilter = types === 'all' ? 'All Events' : `Events: ${types}`;
    const feedType = isAuthenticated ? 'Private Feed' : 'Public Feed';

    return {
        title: `${user}'s GitHub ${feedType} - ${typeFilter}`,
        link: `https://github.com/${user}`,
        description: `GitHub events received by ${user}${types === 'all' ? '' : ` (filtered: ${types})`}${isAuthenticated ? ' - includes private events' : ' - public events only'}`,
        item: items,
    };
}
