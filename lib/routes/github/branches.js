const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;

    const host = `https://github.com/${user}/${repo}`;
    const url = `https://api.github.com/repos/${user}/${repo}/branches`;

    const headers = {};
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const response = await got({
        method: 'get',
        url,
        headers,
    });
    const data = response.data;

    ctx.state.data = {
        title: `${user}/${repo} Branches`,
        link: `${host}/branches/all`,
        item: data.map((item) => ({
            title: item.name,
            description: item.name,
            link: `${host}/commits/${item.name}`,
        })),
    };
};
