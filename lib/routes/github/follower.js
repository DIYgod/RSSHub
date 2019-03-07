const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const host = `https://github.com/${user}`;
    const url = 'https://api.github.com/graphql';

    const response = await axios({
        method: 'post',
        url,
        headers: {
            Authorization: `bearer ${config.github.access_token}`,
        },
        data: {
            query: `
            {
                user(login: "${user}") {
                  followers(first: 10) {
                    edges {
                      node {
                        login
                        avatarUrl
                      }
                    }
                  }
                }
              }
            `,
        },
    });

    const data = response.data.data.user.followers.edges;

    ctx.state.data = {
        title: `${user}'s followers`,
        link: host,
        item: data.map((follower) => ({
            title: `${follower.node.login} started following ${user}`,
            description: `<a href="https://github.com/${follower.node.login}">${follower.node.login}</a> <br> <img referrerpolicy="no-referrer" sytle="width:50px;" src='${follower.node.avatarUrl}'>`,
            link: `https://github.com/${follower.node.login}`,
        })),
    };
};
