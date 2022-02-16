const got = require('@/utils/got');
const config = require('@/config').value;
const md = require('markdown-it')({
    html: true,
    linkify: true,
});
const queryString = require('query-string');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const state = ctx.params.state;
    const labels = ctx.params.labels;

    const host = `https://github.com/${user}/${repo}/issues`;
    const url = `https://api.github.com/repos/${user}/${repo}/issues`;

    const headers = {};
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
                pubDate: new Date(item.created_at).toUTCString(),
                author: item.user.login,
                link: `${host}/${item.number}`,
            })),
    };
};
