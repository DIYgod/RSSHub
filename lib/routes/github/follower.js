const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.github || !config.github.access_token) {
        throw 'GitHub follower RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }
    const user = ctx.params.user;

    const host = `https://github.com/${user}`;
    const url = 'https://api.github.com/graphql';

    const response = await got({
        method: 'post',
        url,
        headers: {
            Authorization: `bearer ${config.github.access_token}`,
        },
        json: {
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
        allowEmpty: true,
        title: `${user}'s followers`,
        link: host,
        item: data.map((follower) => ({
            title: `${follower.node.login} started following ${user}`,
            author: follower.node.login,
            description: `<a href="https://github.com/${follower.node.login}">${follower.node.login}</a> <br> <img sytle="width:50px;" src='${follower.node.avatarUrl}'>`,
            link: `https://github.com/${follower.node.login}`,
        })),
    };
};
