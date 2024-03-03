// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
const md = require('markdown-it')({
    html: true,
});

export default async (ctx) => {
    const { owner, repo } = ctx.req.param();

    const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/events`;
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
        payload: item.payload,
    }));

    items = items.map((item) => {
        switch (item.type) {
            case 'IssueEvent':
                item.title = item.payload.title;
                item.description = md.render(item.payload.body);
                item.link = item.payload.html_url;
                break;
            case 'ForkEvent':
                item.title = `${item.author || item.actor.login} forked ${owner}/${repo}`;
                item.link = item.payload.html_url;
                break;
            case 'StarEvent':
                item.title = `${item.author || item.actor.login} ${item.payload.action} ${owner}/${repo}`;
                break;
            case 'IssueCommentEvent':
                item.title = item.payload.issue.title;
                item.description = md.render(item.payload.comment.body);
                item.link = item.payload.comment.html_url;
                break;
            default:
                break;
        }
        delete item.type;
        delete item.payload;
        return item;
    });

    ctx.set('data', {
        title: `${owner}/${repo} - 仓库动态`,
        link: `https://gitee.com/${owner}/${repo}`,
        item: items,
    });
};
