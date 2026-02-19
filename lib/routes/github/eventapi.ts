import { parseDate } from '@/utils/parse-date';

export const eventTypeMapping: Record<string, string> = {
    create: 'CreateEvent',
    delete: 'DeleteEvent',
    issuecomm: 'IssueCommentEvent',
    fork: 'ForkEvent',
    member: 'MemberEvent',
    public: 'PublicEvent',
    push: 'PushEvent',
    pr: 'PullRequestEvent',
    prcomm: 'PullRequestReviewCommentEvent',
    release: 'ReleaseEvent',
    star: 'WatchEvent',
    issue: 'IssuesEvent',
    prrev: 'PullRequestReviewEvent',
    discussion: 'DiscussionEvent',
    wiki: 'GollumEvent',
    cmcomm: 'CommitCommentEvent',
};

function formatEventItem(event: any) {
    const { id, type, actor, repo, payload, created_at } = event;

    let title: string;
    let description: string;
    let link: string;

    switch (type) {
        case 'PushEvent': {
            title = `${actor.login} pushed to ${repo.name}`;
            const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'unknown';
            const commitCount = payload.size ? `${payload.size} commit(s) ` : '';
            description = `Pushed ${commitCount}to ${branch} in ${repo.name}`;

            if (payload.commits) {
                link = payload.commits.at(-1).url.replace(/https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/commits\/(\d+)/, 'https://github.com/$1/$2/commit/$3');
                description += `<br><strong>Latest commit:</strong> ${payload.commits.at(-1).message}`;
            } else {
                link = `https://github.com/${repo.name}/commit/${payload.head}`;
            }
            break;
        }
        case 'PullRequestEvent':
            title = `${actor.login} ${payload.action} a pull request in ${repo.name}`;
            if (payload.pull_request) {
                link = payload.pull_request.url.replace(/https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/pulls\/(\d+)/, 'https://github.com/$1/$2/pull/$3');
                description = `PR: ${link}`;
            } else {
                link = `https://github.com/${repo.name}`;
                description = `PR: Unknown`;
            }
            break;
        case 'PullRequestReviewCommentEvent':
            title = `${actor.login} commented on a pull request review in ${repo.name}`;
            description = `Comment: ${payload.comment?.body || 'No comment'}`;
            link = payload.comment?.html_url || `https://github.com/${repo.name}`;
            break;
        case 'PullRequestReviewEvent':
            title = `${actor.login} reviewed a pull request in ${repo.name}`;
            description = `${actor.login} ${payload.review?.state ?? 'operated'} the PR` + (payload.review?.body ? `: ${payload.review.body}` : '');
            link = payload.review?.html_url || `https://github.com/${repo.name}`;
            break;
        case 'IssueCommentEvent':
            title = `${actor.login} commented on an issue in ${repo.name}`;
            description = `Comment: ${payload.comment?.body || 'No comment'}`;
            link = payload.comment?.html_url || `https://github.com/${repo.name}`;
            break;
        case 'IssuesEvent':
            title = `${actor.login} ${payload.action} an issue in ${repo.name}`;
            description = `Issue: ${payload.issue?.title || 'Unknown'}`;
            link = payload.issue?.html_url || `https://github.com/${repo.name}`;
            break;
        case 'CommitCommentEvent':
            title = `${actor.login} commented on a commit in ${repo.name}`;
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
        case 'GollumEvent':
            title = `${actor.login} update the wiki in ${repo.name}`;
            description = '<ul>';
            for (const page of payload.pages ?? []) {
                description += `<li>Page <a href=${page.html_url}>${page.page_name}</a> ${page.action} ${page.summary ? `: ${page.summary}` : ''}</li>`;
            }
            description += `</ul>`;
            link = `https://github.com/${repo.name}`;
            break;
        case 'DiscussionEvent':
            title = `${actor.login} ${payload.action} a discussion ${repo.discussion?.title ?? ''} on ${repo.name}`;
            description = payload.discussion?.body ?? 'Unknown';
            link = payload.discussion?.html_url || `https://github.com/${repo.name}`;
            break;
        default:
            title = `${actor.login} performed ${type} in ${repo?.name || 'unknown repository'}`;
            description = `Activity type: ${type} ${JSON.stringify(event)}`;
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

export function filterEvents(types: string, data: any) {
    // Parse requested event types and map short names to full event types
    let filteredEventTypes: string[] = [];
    if (types !== 'all') {
        filteredEventTypes = types.split(',').map((type) => {
            const trimmedType = type.trim();
            return eventTypeMapping[trimmedType] || trimmedType;
        });
    }
    return data.filter((event) => filteredEventTypes.length === 0 || filteredEventTypes.includes(event.type)).map((event) => formatEventItem(event));
}
