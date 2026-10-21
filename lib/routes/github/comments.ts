import { escapeAttribute, escapeText } from 'entities';
import MarkdownIt from 'markdown-it';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const md = MarkdownIt({
    html: true,
});
const rootUrl = 'https://github.com';
const apiUrl = 'https://api.github.com';

const issueSelection = `
    id
    number
    title
    url
    body
    bodyHTML
    createdAt
    author { login }
`;
const timelineSelection = `
    pageInfo { hasPreviousPage }
    nodes { __typename ...TimelineItem }
`;
const timelineQuery = `
    query($user: String!, $repo: String!, $number: Int!, $limit: Int!) {
        repository(owner: $user, name: $repo) {
            issueOrPullRequest(number: $number) {
                __typename
                ... on Issue {
                    ${issueSelection}
                    timelineItems(last: $limit, itemTypes: [CLOSED_EVENT, ISSUE_COMMENT, CROSS_REFERENCED_EVENT, RENAMED_TITLE_EVENT]) {
                        ${timelineSelection}
                    }
                }
                ... on PullRequest {
                    ${issueSelection}
                    timelineItems(last: $limit, itemTypes: [CLOSED_EVENT, ISSUE_COMMENT, CROSS_REFERENCED_EVENT, RENAMED_TITLE_EVENT, PULL_REQUEST_REVIEW]) {
                        ${timelineSelection}
                    }
                }
            }
        }
    }
    fragment TimelineItem on Node {
        id
        ... on ClosedEvent {
            actor { login }
            createdAt
            url
        }
        ... on IssueComment {
            author { login }
            body
            bodyHTML
            createdAt
            url
        }
        ... on CrossReferencedEvent {
            actor { login }
            createdAt
            source {
                ... on Issue { number title url }
                ... on PullRequest { number title url }
            }
        }
        ... on RenamedTitleEvent {
            actor { login }
            createdAt
            previousTitle
            currentTitle
        }
        ... on PullRequestReview {
            author { login }
            body
            bodyHTML
            state
            submittedAt
            url
        }
    }
`;

interface GraphqlTimelineItem {
    id: string;
    __typename: 'ClosedEvent' | 'IssueComment' | 'CrossReferencedEvent' | 'RenamedTitleEvent' | 'PullRequestReview';
    actor?: { login: string };
    author?: { login: string };
    createdAt?: string;
    submittedAt?: string;
    url?: string;
    body?: string;
    bodyHTML?: string;
    state?: string;
    previousTitle?: string;
    currentTitle?: string;
    source?: { number: number; title: string; url: string };
}

interface GraphqlIssue {
    id: string;
    __typename: 'Issue' | 'PullRequest';
    number: number;
    title: string;
    url: string;
    body: string;
    bodyHTML: string;
    createdAt: string;
    author?: { login: string };
    timelineItems: {
        pageInfo: { hasPreviousPage: boolean };
        nodes: Array<GraphqlTimelineItem | null>;
    };
}

const typeDict = {
    issue: {
        title: 'Issue',
    },
    issues: {
        title: 'Issue',
    },
    pull: {
        title: 'Pull request',
    },
};

export const route: Route = {
    path: '/comments/:user/:repo/:number?',
    categories: ['programming'],
    example: '/github/comments/DIYgod/RSSHub/8116',
    parameters: {
        user: 'User / Org name',
        repo: 'Repo name',
        number: 'Issue or pull number (if omitted: all)',
    },
    features: {
        requireConfig: [
            {
                name: 'GITHUB_ACCESS_TOKEN',
                optional: true,
                description: 'Required for the latest events of a single issue or pull request whose timeline exceeds one REST API page. Optional for smaller public timelines and repository-wide comments.',
            },
        ],
    },
    radar: [
        {
            source: ['github.com/:user/:repo/:type', 'github.com/:user/:repo/:type/:number'],
            target: '/comments/:user/:repo/:number?',
        },
    ],
    name: 'Issue / Pull Request comments',
    maintainers: ['TonyRL', 'FliegendeWurst'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');
    const repo = ctx.req.param('repo');
    const number = ctx.req.param('number') && Number.isNaN(Number.parseInt(ctx.req.param('number'))) ? 1 : Number.parseInt(ctx.req.param('number'));
    const limit = getRouteLimit(ctx, 100);
    const headers =
        config.github && config.github.access_token
            ? {
                  Accept: 'application/vnd.github.v3+json',
                  Authorization: `token ${config.github.access_token}`,
              }
            : {
                  Accept: 'application/vnd.github.v3+json',
              };

    return await (Number.isNaN(number) ? allIssues(ctx, user, repo, limit, headers) : singleIssue(ctx, user, repo, number, limit, headers));
}

async function allIssues(ctx, user, repo, limit, headers) {
    const response = await ofetch.raw(`${apiUrl}/repos/${user}/${repo}/issues/comments`, {
        headers,
        query: {
            sort: 'updated',
            direction: 'desc',
            per_page: limit,
        },
    });

    const timeline = response._data;

    const items = timeline.map((item) => {
        const actor = item.actor?.login ?? item.user?.login ?? 'ghost';
        const issueUrlParts = item.issue_url.split('/');
        const issue = issueUrlParts.at(-1);
        const urlParts = item.html_url.split('/');
        const issueType = typeDict[urlParts.at(-2)].title;

        return {
            title: `${actor} commented on ${user}/${repo}: ${issueType} #${issue}`,
            author: actor,
            pubDate: parseDate(item.created_at),
            link: item.html_url,
            description: item.body ? md.render(item.body) : null,
        };
    });

    const rateLimit = {
        limit: Number.parseInt(response.headers.get('x-ratelimit-limit') ?? ''),
        remaining: Number.parseInt(response.headers.get('x-ratelimit-remaining') ?? ''),
        reset: parseDate(Number.parseInt(response.headers.get('x-ratelimit-reset') ?? '') * 1000),
        resoure: response.headers.get('x-ratelimit-resource'),
        used: Number.parseInt(response.headers.get('x-ratelimit-used') ?? ''),
    };

    const ret = {
        title: `${user}/${repo}: Issue & Pull request comments`,
        link: `${rootUrl}/${user}/${repo}`,
        item: items,
    };

    ctx.set('json', {
        ...ret,
        rateLimit,
    });
    return ret;
}

async function singleIssue(ctx, user, repo, number, limit, headers) {
    if (config.github.access_token) {
        return singleIssueGraphql(ctx, user, repo, number, Math.min(limit, 100), headers);
    }

    const response = await ofetch.raw(`${apiUrl}/repos/${user}/${repo}/issues/${number}`, {
        headers,
    });
    const issue = response._data;
    const type = issue.pull_request ? 'pull' : 'issue';

    const timelineResponse = await ofetch.raw(issue.timeline_url, {
        headers,
        query: {
            per_page: 100,
        },
    });
    const items: DataItem[] = [];
    if (/rel="(?:next|last)"/.test(timelineResponse.headers.get('link') ?? '')) {
        throw new ConfigNotFoundError('This GitHub timeline spans multiple REST API pages. Configure GITHUB_ACCESS_TOKEN to retrieve its latest events without pagination.');
    }
    const timeline = timelineResponse._data.filter((item) => ['closed', 'commented', 'cross-referenced', 'renamed', 'reviewed'].includes(item.event)).slice(-limit);
    if (timeline.length < limit) {
        items.push({
            title: `${issue.user.login} created ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
            description: issue.body ? md.render(issue.body) : null,
            author: issue.user.login,
            pubDate: parseDate(issue.created_at),
            link: `${issue.html_url}#issue-${issue.id}`,
        });
    }
    for (const item of timeline) {
        const actor = item.actor?.login ?? item.user?.login ?? 'ghost';
        switch (item.event) {
            case 'closed':
                items.push({
                    title: `${actor} ${item.event} ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
                    author: actor,
                    pubDate: parseDate(item.created_at),
                    link: issue.html_url,
                    guid: item.url,
                });
                break;
            case 'commented':
                items.push({
                    title: `${actor} ${item.event} on ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
                    description: md.render(item.body),
                    author: actor,
                    pubDate: parseDate(item.created_at),
                    link: item.html_url,
                });
                break;
            case 'cross-referenced':
                items.push({
                    title: `${actor} ${item.event} on ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
                    description: `${escapeText(actor)} mentioned this issue in <a href="${escapeAttribute(item.source.issue.html_url)}"><b>${escapeText(item.source.issue.title)}</b> #${item.source.issue.number}</a>`,
                    author: actor,
                    pubDate: parseDate(item.created_at),
                    guid: `${actor} ${item.event} on ${user}/${repo}: ${typeDict[type].title} #${issue.number} on ${item.created_at}`,
                    link: item.source.issue.html_url,
                });
                break;
            case 'renamed':
                items.push({
                    title: `${actor} ${item.event} on ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
                    description: `${escapeText(actor)} changed the title <del>${escapeText(item.rename.from)}</del> ${escapeText(item.rename.to)}`,
                    author: actor,
                    pubDate: parseDate(item.created_at),
                    link: issue.html_url,
                    guid: item.url,
                });
                break;
            case 'reviewed':
                items.push({
                    title: `${item.user.login} ${item.event} on ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
                    description: item.body ? md.render(item.body) : item.state.replace('_', ' '),
                    author: item.user.login,
                    pubDate: parseDate(item.submitted_at),
                    link: item.html_url,
                });
                break;
            default:
                break;
        }
    }

    const ret = {
        title: `${user}/${repo}: ${typeDict[type].title} #${number} - ${issue.title}`,
        link: issue.html_url,
        item: items,
    };

    const resetTimestamp = Number.parseInt(response.headers.get('x-ratelimit-reset') ?? '');
    ctx.set('json', {
        ...ret,
        rateLimit: {
            limit: Number.parseInt(response.headers.get('x-ratelimit-limit') ?? ''),
            remaining: Number.parseInt(response.headers.get('x-ratelimit-remaining') ?? ''),
            reset: parseDate(resetTimestamp * 1000),
            resoure: response.headers.get('x-ratelimit-resource'),
            used: Number.parseInt(response.headers.get('x-ratelimit-used') ?? ''),
        },
    });
    return ret;
}

async function singleIssueGraphql(ctx, user: string, repo: string, number: number, limit: number, headers) {
    const response = await ofetch.raw<{
        data?: { repository?: { issueOrPullRequest?: GraphqlIssue } };
        errors?: Array<{ message: string }>;
    }>(`${apiUrl}/graphql`, {
        method: 'POST',
        headers,
        body: { query: timelineQuery, variables: { user, repo, number, limit } },
    });
    if (response._data?.errors?.length) {
        throw new Error(`GitHub GraphQL timeline request failed: ${response._data.errors.map((error) => error.message).join('; ')}`);
    }
    if (!response._data?.data) {
        throw new Error('GitHub GraphQL timeline request returned no data.');
    }
    const issue = response._data?.data?.repository?.issueOrPullRequest;
    if (!issue) {
        throw new NotFoundError(`GitHub issue or pull request ${user}/${repo}#${number} was not found or is inaccessible to GITHUB_ACCESS_TOKEN.`);
    }
    const items = issue.timelineItems.nodes.flatMap((item) => (item ? renderGraphqlTimelineItem(item, issue, user, repo) : []));
    if (!issue.timelineItems.pageInfo.hasPreviousPage && issue.timelineItems.nodes.length < limit) {
        const actor = issue.author?.login ?? 'ghost';
        items.unshift({
            title: `${actor} created ${user}/${repo}: ${issue.__typename === 'PullRequest' ? 'Pull request' : 'Issue'} #${issue.number}`,
            description: issue.bodyHTML || (issue.body ? md.render(issue.body) : undefined),
            author: actor,
            pubDate: parseDate(issue.createdAt),
            link: issue.url,
            guid: issue.id,
        });
    }

    const ret = {
        title: `${user}/${repo}: ${issue.__typename === 'PullRequest' ? 'Pull request' : 'Issue'} #${number} - ${issue.title}`,
        link: issue.url,
        item: items.toReversed(),
    };
    const resetTimestamp = Number.parseInt(response.headers.get('x-ratelimit-reset') ?? '');
    ctx.set('json', {
        ...ret,
        rateLimit: {
            limit: Number.parseInt(response.headers.get('x-ratelimit-limit') ?? ''),
            remaining: Number.parseInt(response.headers.get('x-ratelimit-remaining') ?? ''),
            reset: parseDate(resetTimestamp * 1000),
            resoure: response.headers.get('x-ratelimit-resource'),
            used: Number.parseInt(response.headers.get('x-ratelimit-used') ?? ''),
        },
    });
    return ret;
}

function renderGraphqlTimelineItem(item: GraphqlTimelineItem, issue: GraphqlIssue, user: string, repo: string): DataItem[] {
    const actor = item.actor?.login ?? item.author?.login ?? 'ghost';
    const subject = `${user}/${repo}: ${issue.__typename === 'PullRequest' ? 'Pull request' : 'Issue'} #${issue.number}`;
    const createdAt = item.__typename === 'PullRequestReview' ? item.submittedAt : item.createdAt;
    const base = {
        author: actor,
        pubDate: createdAt ? parseDate(createdAt) : undefined,
        link: item.url ?? issue.url,
        guid: item.id,
    };
    switch (item.__typename) {
        case 'ClosedEvent':
            return [{ ...base, title: `${actor} closed ${subject}` }];
        case 'IssueComment':
            return [{ ...base, title: `${actor} commented on ${subject}`, description: item.bodyHTML || md.render(item.body ?? '') }];
        case 'CrossReferencedEvent':
            return item.source
                ? [
                      {
                          ...base,
                          title: `${actor} cross-referenced on ${subject}`,
                          description: `${escapeText(actor)} mentioned this issue in <a href="${escapeAttribute(item.source.url)}"><b>${escapeText(item.source.title)}</b> #${item.source.number}</a>`,
                          link: item.source.url,
                      },
                  ]
                : [];
        case 'RenamedTitleEvent':
            return [{ ...base, title: `${actor} renamed on ${subject}`, description: `${escapeText(actor)} changed the title <del>${escapeText(item.previousTitle ?? '')}</del> ${escapeText(item.currentTitle ?? '')}` }];
        case 'PullRequestReview':
            return item.submittedAt ? [{ ...base, title: `${actor} reviewed on ${subject}`, description: item.bodyHTML || (item.body ? md.render(item.body) : item.state?.replaceAll('_', ' ')) }] : [];
        default:
            return [];
    }
}
