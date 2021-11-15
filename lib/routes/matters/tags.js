import got from '~/utils/got.js';
import {parseDate} from '~/utils/parse-date.js';

export default async (ctx) => {
    const {
      tid
    } = ctx.params;
    const host = `https://matters.news`;
    const url = `https://server.matters.news/graphql`;
    const response = await got({
        method: 'post',
        url,
        json: {
            query: `
                   {
                     node(input: { id: "${tid}" }) {
                       ... on Tag {
                         content
                         articles(input:{first: 20}){
                           edges {
                             node {
                               id
                               title
                               slug
                               cover
                               summary
                               mediaHash
                               content
                               createdAt
                               author {
                                 id
                                 userName
                                 displayName
                               }
                             }
                           }
                         }
                       }
                     }
                   }`,
        },
    });

    const {
      node
    } = response.data.data;

    ctx.state.data = {
        title: `Matters | ${node.content}`,
        link: `${host}/tags/${tid}`,
        description: node.content,
        item: node.articles.edges.map(({ node: article }) => ({
            title: article.title,
            author: article.author.displayName,
            description: article.content,
            link: `${host}/@${article.author.id}/${article.slug}-${article.mediaHash}`,
            pubDate: parseDate(article.createdAt),
        })),
    };
};
