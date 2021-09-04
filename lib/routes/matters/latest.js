const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'latest';
    const url = `https://server.matters.news/graphql`;
    const options = {
        latest: {
            title: '最新',
            apiType: 'newest',
        },
        heat: {
            title: '熱議',
            apiType: 'hottest',
        },
        essence: {
            title: '精華',
            apiType: 'icymi',
        },
    };

    const response = await got({
        method: 'post',
        url,
        json: {
            query: `
            {
                viewer {
                  id
                  recommendation {
                    feed: ${options[type].apiType}(input: { first: 10 }) {
                      edges {
                        node {
                          author {
                            userName
                            displayName
                          }
                          slug
                          mediaHash
                          title
                          content
                          createdAt
                        }
                      }
                    }
                  }
                }
              }`,
        },
    });

    const item = response.data.data.viewer.recommendation.feed.edges.map(({ node }) => {
        const link = `https://matters.news/@${node.author.userName}/${node.slug}-${node.mediaHash}`;
        const article = node.content;
        return {
            title: node.title,
            link,
            description: article,
            author: node.author.displayName,
            pubDate: node.createdAt,
        };
    });

    ctx.state.data = {
        title: `Matters | ${options[type].title}`,
        link: 'https://matters.news/',
        item,
    };
};
