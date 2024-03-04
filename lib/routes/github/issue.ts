// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';
const md = require('markdown-it')({
    html: true,
    linkify: true,
});
import queryString from 'query-string';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const user = ctx.req.param('user');
    const repo = ctx.req.param('repo');
    const state = ctx.req.param('state');
    const labels = ctx.req.param('labels');
    const limit = ctx.req.query('limit') ? (Number.parseInt(ctx.req.query('limit')) > 100 ? 100 : Number.parseInt(ctx.req.query('limit'))) : 100;

    const host = `https://github.com/${user}/${repo}/issues`;
    const url = `https://api.github.com/repos/${user}/${repo}/issues`;

    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const response = await got({
        method: 'get',
        url,
        searchParams: queryString.stringify({
            state,
            labels,
            sort: 'created',
            direction: 'desc',
            per_page: limit,
        }),
        headers,
    });
    const data = response.data;

    ctx.set('data', {
        allowEmpty: true,
        title: `${user}/${repo}${state ? ' ' + state.replace(/^\S/, (s) => s.toUpperCase()) : ''} Issues${labels ? ' - ' + labels : ''}`,
        link: host,
        item: data
            .filter((item) => item.pull_request === undefined)
            .map((item) => ({
                title: item.title,
                description: item.body ? md.render(item.body) : 'No description',
                pubDate: parseDate(item.created_at),
                author: item.user.login,
                link: `${host}/${item.number}`,
            })),
    });
};
