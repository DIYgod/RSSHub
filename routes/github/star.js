const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;

    const host = `https://github.com/${user}/${repo}/stargazers`;
    const url = `https://api.github.com/repos/${user}/${repo}/stargazers`;

    const response = await axios({
        method: 'get',
        url,
        params: {
            access_token: config.github.access_token,
        },
    });
    const data = response.data;

    ctx.state.data = {
        title: `${user}/${repo}’s stargazers`,
        link: host,
        item: data.map((follower) => ({
            title: `New stargazer: ${follower.login}`,
            description: `${follower.html_url} <br> <img src='${follower.avatar_url}'>`,
            link: `https://github.com/${follower.login}`,
        })),
    };
};
