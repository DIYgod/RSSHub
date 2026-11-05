import MarkdownIt from 'markdown-it';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/events/:owner/:repo',
    categories: ['programming'],
    example: '/gitee/events/y_project/RuoYi',
    parameters: { owner: '用户名', repo: '仓库名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gitee.com/:owner/:repo'],
        },
    ],
    name: '仓库动态',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { owner, repo } = ctx.req.param();

    const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/events`;
    const limit = getRouteLimit(ctx, 100);
    const response = await cache.tryGet(
        `${apiUrl}:${limit}`,
        async () =>
            (
                await got(apiUrl, {
                    searchParams: {
                        access_token: config.gitee.access_token ?? undefined,
                        limit,
                    },
                })
            ).data
    );

    let items = response.map((item) => ({
        title: item.type,
        author: item.actor.login,
        pubDate: parseDate(item.created_at),
        guid: item.id,
        link: `https://gitee.com/${owner}/${repo}`,
        type: item.type,
        payload: item.payload,
    }));

    items = items.map((item) => {
        switch (item.type) {
            case 'IssueEvent':
                item.title = item.payload.title;
                item.description = typeof item.payload.body === 'string' ? md.render(item.payload.body) : undefined;
                item.link = item.payload.html_url;
                break;
            case 'ForkEvent':
                item.title = `${item.author || item.actor.login} forked ${owner}/${repo}`;
                if (item.payload.full_name) {
                    item.link = `https://gitee.com/${item.payload.full_name}`;
                }
                break;
            case 'StarEvent':
                item.title = `${item.author || item.actor.login} ${item.payload.action} ${owner}/${repo}`;
                break;
            case 'IssueCommentEvent':
                item.title = item.payload.issue.title;
                item.description = typeof item.payload.comment.body === 'string' ? md.render(item.payload.comment.body) : undefined;
                item.link = item.payload.comment.html_url;
                break;
            default:
                break;
        }
        delete item.type;
        delete item.payload;
        return item;
    });

    return {
        title: `${owner}/${repo} - 仓库动态`,
        link: `https://gitee.com/${owner}/${repo}`,
        item: items,
    };
}
