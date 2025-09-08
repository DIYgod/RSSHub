import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';

const md = MarkdownIt({ html: true });

const rootUrl = 'https://youtrack.jetbrains.com';
const apiUrl = `${rootUrl}/api`;

const ACTIVITY_CATEGORIES = 'IssueCreatedCategory,CommentsCategory';
const ACTIVITY_FIELDS = 'activities(author(name),category(id),id,issue(description),timestamp,added(author(name),created,id,text,usesMarkdown))';
const ISSUE_FIELDS = 'summary';

export const route: Route = {
    path: '/youtrack/comments/:issueId',
    categories: ['programming'],
    example: '/jetbrains/youtrack/comments/IJPL-174543',
    parameters: {
        issueId: 'Issue ID (e.g., IJPL-174543)',
    },
    radar: [
        {
            source: ['youtrack.jetbrains.com/issue/:issueId'],
            target: '/youtrack/comments/:issueId',
        },
    ],
    name: 'YouTrack Issue Comments',
    maintainers: ['NekoAria'],
    handler,
};

function processIssueCreated(activity, issueId) {
    const description = md.render(activity.issue.description);

    return {
        title: `${activity.author.name} created issue ${issueId}`,
        author: activity.author.name,
        pubDate: parseDate(activity.timestamp),
        link: `${rootUrl}/issue/${issueId}#focus=Comments-${activity.id}`,
        description,
        guid: `${issueId}-comment-${activity.id}`,
    };
}

function processComment(activity, issueId) {
    const comment = activity.added[0];
    const author = comment.author || activity.author;
    const description = comment.usesMarkdown ? md.render(comment.text) : comment.text;

    return {
        title: `${author.name} commented on ${issueId}`,
        author: author.name,
        pubDate: parseDate(comment.created || activity.timestamp),
        link: `${rootUrl}/issue/${issueId}#focus=Comments-${activity.id}`,
        description,
        guid: `${issueId}-comment-${activity.id}`,
    };
}

function processActivity(activity, issueId) {
    switch (activity.category.id) {
        case 'IssueCreatedCategory':
            return processIssueCreated(activity, issueId);
        case 'CommentsCategory':
            return processComment(activity, issueId);
        default:
            return null;
    }
}

async function handler(ctx) {
    const issueId = ctx.req.param('issueId');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;

    const issueInfo = await ofetch(`${apiUrl}/issues/${issueId}`, {
        query: { fields: ISSUE_FIELDS },
    });

    const response = await ofetch(`${apiUrl}/issues/${issueId}/activitiesPage`, {
        query: {
            categories: ACTIVITY_CATEGORIES,
            fields: ACTIVITY_FIELDS,
        },
    });

    const items = response.activities
        .map((activity) => processActivity(activity, issueId))
        .filter((item) => item !== null)
        .toSorted((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, limit);

    return {
        title: `YouTrack ${issueId} - ${issueInfo.summary}`,
        link: `${rootUrl}/issue/${issueId}`,
        description: `Comments and activities for YouTrack issue ${issueId}`,
        item: items,
    };
}
