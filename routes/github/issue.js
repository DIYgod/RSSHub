const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;

    const host = `https://github.com/repos/${user}/${repo}/issues`;
    const url = `https://api.github.com/repos/${user}/${repo}/issues`;

    const response = await axios({
        method: 'get',
        url,
        headers: {
            'User-Agent': config.ua,
        },
        params: {
            sort: 'created',
            access_token: config.github.access_token,
        },
    });
    const data = response.data;
    ctx.state.data = {
        title: `${user}/${repo} Issues`,
        link: host,
        item:
            data &&
            data.map((item) => ({
                title: item.title,
                description: item.body || 'No description',
                pubDate: new Date(item.created_at),
                link: `${host}/${item.number}`,
            })),
    };
};
