const got = require('@/utils/got');
const config = require('@/config').value;
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;

    const host = `https://github.com/${user}/${repo}/pulls`;
    const url = `https://api.github.com/repos/${user}/${repo}/pulls`;

    const response = await got({
        method: 'get',
        url,
        params: {
            sort: 'created',
            access_token: config.github && config.github.access_token,
        },
    });
    const data = response.data;

    ctx.state.data = {
        title: `${user}/${repo} Pull requests`,
        link: host,
        item: data.map((item) => ({
            title: item.title,
            description: md.render(item.body) || 'No description',
            pubDate: new Date(item.created_at).toUTCString(),
            link: `${host}/${item.number}`,
        })),
    };
};
