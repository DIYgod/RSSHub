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

    const host = `https://github.com/${user}/${repo}/pulls`;
    const link = `https://github.com/${user}/${repo}/pull`;
    const url = `https://api.github.com/repos/${user}/${repo}/pulls`;

    const headers = {};
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const response = await got({
        method: 'get',
        url,
        searchParams: queryString.stringify({
            sort: 'created',
        }),
        headers,
    });
    const data = response.data;

    ctx.state.data = {
        allowEmpty: true,
        title: `${user}/${repo} Pull requests`,
        link: host,
        item: data.map((item) => ({
            title: item.title,
            author: item.user.login,
            description: item.body ? md.render(item.body) : 'No description',
            pubDate: new Date(item.created_at).toUTCString(),
            link: `${link}/${item.number}`,
        })),
    };
};
