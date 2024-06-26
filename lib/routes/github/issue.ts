import { Route } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});
import queryString from 'query-string';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/issue/:user/:repo/:state?/:labels?',
    categories: ['programming', 'popular'],
    example: '/github/issue/vuejs/core/all/wontfix',
    parameters: {
        user: 'GitHub username',
        repo: 'GitHub repo name',
        state: {
            description: 'the state of the issues.',
            default: 'open',
            options: [
                {
                    label: 'Open',
                    value: 'open',
                },
                {
                    label: 'Closed',
                    value: 'closed',
                },
                {
                    label: 'All',
                    value: 'all',
                },
            ],
        },
        labels: 'a list of comma separated label names',
    },
    radar: [
        {
            source: ['github.com/:user/:repo/issues', 'github.com/:user/:repo/issues/:id', 'github.com/:user/:repo'],
            target: '/issue/:user/:repo',
        },
    ],
    name: 'Repo Issues',
    maintainers: ['HenryQW', 'AndreyMZ'],
    handler,
};

async function handler(ctx) {
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

    return {
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
    };
}
