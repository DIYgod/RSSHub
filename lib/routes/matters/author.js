const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const host = `https://matters.news`;
    const url = `https://server.matters.news/graphql`;
    const response = await got({
        method: 'post',
        url,
        json: {
            query: `
      {
        user(input: { userName: "${uid}" }) {
          displayName
          info {
            description
          }
          articles(input: { first: 20 }) {
            edges {
              node {
                slug
                mediaHash
                title
                content
                createdAt
              }
            }
          }
        }
      }`,
        },
    });

    const user = response.data.data.user;

    ctx.state.data = {
        title: `Matters | ${user.displayName}`,
        link: `${host}/@${uid}`,
        description: user.info.description,
        item: user.articles.edges.map(({ node: article }) => ({
            title: article.title,
            author: user.displayName,
            description: article.content,
            link: `${host}/@${uid}/${article.slug}-${article.mediaHash}`,
            pubDate: parseDate(article.createdAt),
        })),
    };
};
