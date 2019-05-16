const axios = require('@/utils/axios');
const config = require('@/config');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;

    const host = `https://github.com/${user}/${repo}/stargazers`;
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
                repository(owner: "${user}", name: "${repo}") {
                  stargazers(last: 10) {
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

    const data = response.data.data.repository.stargazers.edges.reverse();

    ctx.state.data = {
        title: `${user}/${repo}’s stargazers`,
        link: host,
        item: data.map((follower) => ({
            title: `${follower.node.login} starred ${user}/${repo}`,
            description: `<a href="https://github.com/${follower.node.login}">${follower.node.login}</a> <br> <img referrerpolicy="no-referrer" sytle="width:50px;" src='${follower.node.avatarUrl}'>`,
            link: `https://github.com/${follower.node.login}`,
        })),
    };
};
