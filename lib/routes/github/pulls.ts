import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/pull/:user/:repo/:state?/:labels?',
    categories: ['programming'],
    example: '/github/pull/DIYgod/RSSHub',
    parameters: { user: 'User name', repo: 'Repo name', state: 'the state of pull requests. Can be either `open`, `closed`, or `all`. Default: `open`.', labels: 'a list of comma separated label names' },
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
            source: ['github.com/:user/:repo/pulls', 'github.com/:user/:repo/pulls/:id', 'github.com/:user/:repo'],
            target: '/pull/:user/:repo',
        },
    ],
    name: 'Repo Pull Requests',
    maintainers: ['hashman', 'TonyRL'],
    handler,
};

async function handler(ctx) {
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
    const response = await ofetch(url, {
        query: {
            state,
            labels,
            sort: 'created',
            direction: 'desc',
            per_page: ctx.req.query('limit') ? (Number.parseInt(ctx.req.query('limit')) <= 100 ? Number.parseInt(ctx.req.query('limit')) : 100) : 100,
        },
        headers,
    });
    const data = response.filter((item) => item.pull_request);

    return {
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
    };
}
