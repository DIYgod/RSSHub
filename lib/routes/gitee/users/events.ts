// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
const md = require('markdown-it')({
    html: true,
});

export default async (ctx) => {
    const username = ctx.req.param('username');

    const apiUrl = `https://gitee.com/api/v5/users/${username}/events/public`;
    const response = await cache.tryGet(
        apiUrl,
        async () =>
            (
                await got(apiUrl, {
                    searchParams: {
                        access_token: config.gitee.access_token ?? undefined,
                        limit: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 100,
                    },
                })
            ).data
    );

    let items = response.map((item) => ({
        title: item.type,
        author: item.actor.login,
        pubDate: parseDate(item.created_at),
        guid: item.id,
        type: item.type,
        repo: item.repo,
        payload: item.payload,
    }));

    items = items.map((item) => {
        switch (item.type) {
            case 'CommitCommentEvent':
                item.title = `commented on commit ${item.payload.comment.commit_id.slice(0, 7)} in ${item.payload.repository.full_name}`;
                item.description = md.render(item.payload.comment.body);
                item.link = item.payload.comment.html_url;
                break;
            case 'CreateEvent':
                item.title = `${item.payload.ref_type} ${item.payload.ref} created in ${item.repo.full_name}`;
                break;
            case 'IssueCommentEvent':
                item.title = item.payload.issue.title;
                item.description = md.render(item.payload.comment.body);
                item.link = item.payload.comment.html_url;
                break;
            case 'IssueEvent':
                item.title = `${item.payload.action} ${item.payload.title}`;
                item.description = md.render(item.payload.body);
                item.link = item.payload.html_url;
                break;
            case 'ProjectCommentEvent':
                item.title = `commented on project ${item.repo.full_name}`;
                item.description = md.render(item.payload.comment.body);
                item.link = item.payload.comment.html_url;
                break;
            case 'PullRequestEvent':
                item.title = `${item.payload.action} pull request #${item.payload.number} ${item.payload.title} in ${item.repo.full_name}`;
                item.description = md.render(item.payload.body);
                item.link = item.payload.html_url;
                break;
            case 'PushEvent':
                item.title = `committed ${item.payload.commits[0].sha.slice(0, 7)} in ${item.repo.full_name}`;
                item.description = md.render(item.payload.commits[0].message);
                item.link = `http://gitee.com/${item.repo.full_name}/commit/${item.payload.commits[0].sha}`;
                break;
            default:
                break;
        }
        delete item.type;
        delete item.repo;
        delete item.payload;
        return item;
    });

    ctx.set('data', {
        title: `${username} - 公开动态`,
        link: `https://gitee.com/${username}`,
        item: items,
    });
};
