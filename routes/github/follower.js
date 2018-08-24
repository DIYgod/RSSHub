const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const host = `https://github.com/${user}`;
    const url = `https://api.github.com/users/${user}/followers`;

    const response = await axios({
        method: 'get',
        url,
        params: {
            access_token: config.github.access_token,
        },
    });
    const data = response.data;

    ctx.state.data = {
        title: `${user}'s followers`,
        link: host,
        item: data.reverse().map((follower) => ({
            title: `${follower.login} started following ${user}`,
            description: `${follower.html_url} <br> <img src='${follower.avatar_url}'>`,
            link: `https://github.com/${follower.login}`,
        })),
    };
};
