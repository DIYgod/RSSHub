const got = require('@/utils/got');
const config = require('@/config').value;
const md = require('markdown-it')({
    html: true,
    linkify: true,
});
const queryString = require('query-string');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const state = ctx.params.state;
    const labels = ctx.params.labels;
    const limit = ctx.query.limit ? (parseInt(ctx.query.limit) > 100 ? 100 : parseInt(ctx.query.limit)) : 100;

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

    ctx.state.data = {
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
};
