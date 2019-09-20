const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;

    const host = `https://github.com/${user}/${repo}`;
    const url = `https://api.github.com/repos/${user}/${repo}/branches`;

    const response = await got({
        method: 'get',
        url,
        params: {
            access_token: config.github && config.github.access_token,
        },
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
