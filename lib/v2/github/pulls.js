const got = require('@/utils/got');
const config = require('@/config').value;
const md = require('markdown-it')({
    html: true,
    linkify: true,
});
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const state = ctx.params.state ?? 'open';
    const labels = ctx.params.labels;

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
            per_page: ctx.query.limit ? (parseInt(ctx.query.limit) <= 100 ? parseInt(ctx.query.limit) : 100) : 100,
        },
        headers,
    });
    const data = response.data.filter((item) => item.pull_request);

    ctx.state.data = {
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
};
