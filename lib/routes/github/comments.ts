import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
});
const rootUrl = 'https://github.com';
const apiUrl = 'https://api.github.com';
import { config } from '@/config';
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
    const number = ctx.req.param('number') && isNaN(Number.parseInt(ctx.req.param('number'))) ? 1 : Number.parseInt(ctx.req.param('number'));
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;
    const headers =
        config.github && config.github.access_token
            ? {
                  Accept: 'application/vnd.github.v3+json',
                  Authorization: `token ${config.github.access_token}`,
              }
            : {
                  Accept: 'application/vnd.github.v3+json',
              };

    return await (isNaN(number) ? allIssues(ctx, user, repo, limit, headers) : singleIssue(ctx, user, repo, number, limit, headers));
}

async function allIssues(ctx, user, repo, limit, headers) {
    const response = await got(`${apiUrl}/repos/${user}/${repo}/issues/comments`, {
        headers,
        searchParams: {
            sort: 'updated',
            direction: 'desc',
            per_page: limit,
        },
    });

    const timeline = response.data;

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

    // response headers is broken due to #14922
    // const rateLimit = {
    //     limit: Number.parseInt(response.headers['x-ratelimit-limit']),
    //     remaining: Number.parseInt(response.headers['x-ratelimit-remaining']),
    //     reset: parseDate(Number.parseInt(response.headers['x-ratelimit-reset']) * 1000),
    //     resoure: response.headers['x-ratelimit-resource'],
    //     used: Number.parseInt(response.headers['x-ratelimit-used']),
    // };

    const ret = {
        title: `${user}/${repo}: Issue & Pull request comments`,
        link: `${rootUrl}/${user}/${repo}`,
        item: items,
    };

    ctx.set('json', {
        ...ret,
        // rateLimit,
    });
    return ret;
}

async function singleIssue(ctx, user, repo, number, limit, headers) {
    const response = await got(`${apiUrl}/repos/${user}/${repo}/issues/${number}`, {
        headers,
    });
    const issue = response.data;
    const type = issue.pull_request ? 'pull' : 'issue';

    const timelineResponse = await got(issue.timeline_url, {
        headers,
        searchParams: {
            per_page: limit,
        },
    });
    const timeline = timelineResponse.data;

    const items = [
        {
            title: `${issue.user.login} created ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
            description: issue.body ? md.render(issue.body) : null,
            author: issue.user.login,
            pubDate: parseDate(issue.created_at),
            link: `${issue.html_url}#issue-${issue.id}`,
        },
    ];

    for (const item of timeline) {
        const actor = item.actor?.login ?? item.user?.login ?? 'ghost';
        switch (item.event) {
            case 'closed':
                items.push({
                    title: `${actor} ${item.event} ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
                    author: actor,
                    pubDate: parseDate(item.created_at),
                    link: item.url,
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
                    description: `${actor} mentioned this issue in <a href='${item.source.issue.html_url}'><b>${item.source.issue.title}</b> #${item.source.issue.number}</a>`,
                    author: actor,
                    pubDate: parseDate(item.created_at),
                    guid: `${actor} ${item.event} on ${user}/${repo}: ${typeDict[type].title} #${issue.number} on ${item.created_at}`,
                    link: `${actor} ${item.event} on ${user}/${repo}: ${typeDict[type].title} #${issue.number} on ${item.created_at}`,
                });
                break;
            case 'renamed':
                items.push({
                    title: `${actor} ${item.event} on ${user}/${repo}: ${typeDict[type].title} #${issue.number}`,
                    description: `${actor} changed the title <del>${item.rename.from}</del> ${item.rename.to}`,
                    author: actor,
                    pubDate: parseDate(item.created_at),
                    link: item.url,
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

    ctx.set('json', {
        ...ret,
        // rateLimit: {
        //     limit: Number.parseInt(response.headers['x-ratelimit-limit']),
        //     remaining: Number.parseInt(response.headers['x-ratelimit-remaining']),
        //     reset: parseDate(Number.parseInt(response.headers['x-ratelimit-reset']) * 1000),
        //     resoure: response.headers['x-ratelimit-resource'],
        //     used: Number.parseInt(response.headers['x-ratelimit-used']),
        // },
    });
    return ret;
}
