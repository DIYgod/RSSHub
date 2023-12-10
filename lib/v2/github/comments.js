const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    html: true,
});
const rootUrl = 'https://github.com';
const apiUrl = 'https://api.github.com';
const config = require('@/config').value;
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

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const number = ctx.params.number && isNaN(parseInt(ctx.params.number)) ? 1 : parseInt(ctx.params.number);
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 100;
    const headers =
        config.github && config.github.access_token
            ? {
                  Accept: 'application/vnd.github.v3+json',
                  Authorization: `token ${config.github.access_token}`,
              }
            : {
                  Accept: 'application/vnd.github.v3+json',
              };

    if (isNaN(number)) {
        await allIssues(ctx, user, repo, limit, headers);
    } else {
        await singleIssue(ctx, user, repo, number, limit, headers);
    }
};

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
        const issue = issueUrlParts[issueUrlParts.length - 1];
        const urlParts = item.html_url.split('/');
        const issueType = typeDict[urlParts[urlParts.length - 2]].title;

        return {
            title: `${actor} commented on ${user}/${repo}: ${issueType} #${issue}`,
            author: actor,
            pubDate: parseDate(item.created_at),
            link: item.html_url,
            description: item.body ? md.render(item.body) : null,
        };
    });

    const rateLimit = {
        limit: parseInt(response.headers['x-ratelimit-limit']),
        remaining: parseInt(response.headers['x-ratelimit-remaining']),
        reset: parseDate(parseInt(response.headers['x-ratelimit-reset']) * 1000),
        resoure: response.headers['x-ratelimit-resource'],
        used: parseInt(response.headers['x-ratelimit-used']),
    };

    ctx.state.data = {
        title: `${user}/${repo}: Issue & Pull request comments`,
        link: `${rootUrl}/${user}/${repo}`,
        item: items,
    };

    ctx.state.json = {
        title: `${user}/${repo}: Issue & Pull request comments`,
        link: `${rootUrl}/${user}/${repo}`,
        item: items,
        rateLimit,
    };
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

    timeline.forEach((item) => {
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
    });

    ctx.state.data = {
        title: `${user}/${repo}: ${typeDict[type].title} #${number} - ${issue.title}`,
        link: issue.html_url,
        item: items,
    };

    ctx.state.json = {
        title: `${user}/${repo}: ${typeDict[type].title} #${number} - ${issue.title}`,
        link: issue.html_url,
        item: items,
        rateLimit: {
            limit: parseInt(response.headers['x-ratelimit-limit']),
            remaining: parseInt(response.headers['x-ratelimit-remaining']),
            reset: parseDate(parseInt(response.headers['x-ratelimit-reset']) * 1000),
            resoure: response.headers['x-ratelimit-resource'],
            used: parseInt(response.headers['x-ratelimit-used']),
        },
    };
}
