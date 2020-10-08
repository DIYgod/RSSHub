const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.github || !config.github.access_token) {
        throw 'GitHub star RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }
    const user = ctx.params.user;

    const host = `https://github.com/${user}?tab=stars`;
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
                  starredRepositories(first: 10, orderBy: {direction: DESC, field: STARRED_AT}) {
                    edges {
                      starredAt
                      node {
                        name
                        description
                        url
                        openGraphImageUrl
                        primaryLanguage {
                          name
                        }
                        stargazers {
                          totalCount
                        }
                      }
                    }
                  }
                }
              }
            `,
        },
    });

    const data = response.data.data.user.starredRepositories.edges;

    ctx.state.data = {
        allowEmpty: true,
        title: `${user}’s starred repositories`,
        link: host,
        description: `${user}’s starred repositories`,
        item: data.map((repo) => ({
            title: `${user} starred ${repo.node.name}`,
            author: user,
            description: `${repo.node.description === null ? 'no description' : repo.node.description} <br> primary language: ${
                repo.node.primaryLanguage === null ? 'no primary language' : repo.node.primaryLanguage.name
            } <br> stargazers: ${repo.node.stargazers.totalCount} <br> <img sytle="width:50px;" src='${repo.node.openGraphImageUrl}'>`,
            pubDate: new Date(`${repo.starredAt}`).toUTCString(),
            link: `${repo.node.url}`,
        })),
    };
};
