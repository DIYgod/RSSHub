// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';
const md = require('markdown-it')({
    html: true,
    linkify: true,
});
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const user = ctx.req.param('user');
    const repo = ctx.req.param('repo');
    const state = ctx.req.param('state') ?? 'open';
    const labels = ctx.req.param('labels');

    const host = `https://github.com/${user}/${repo}/pulls`;
    const url = `https://api.github.com/repos/${user}/${repo}/issues`; // every PR is also an issue

    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const response = await got(url, {
        searchParams: {
            state,
            labels,
            sort: 'created',
            direction: 'desc',
            per_page: ctx.req.query('limit') ? (Number.parseInt(ctx.req.query('limit')) <= 100 ? Number.parseInt(ctx.req.query('limit')) : 100) : 100,
        },
        headers,
    });
    const data = response.data.filter((item) => item.pull_request);

    ctx.set('data', {
        allowEmpty: true,
        title: `${user}/${repo} Pull requests`,
        link: host,
        item: data.map((item) => ({
            title: item.title,
            author: item.user.login,
            description: item.body ? md.render(item.body) : 'No description',
            pubDate: parseDate(item.created_at),
            link: item.html_url,
        })),
    });
};
