// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';

export default async (ctx) => {
    if (!config.github || !config.github.access_token) {
        throw new Error('GitHub star RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const user = ctx.req.param('user');

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

    ctx.set('data', {
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
            pubDate: new Date(repo.starredAt),
            link: repo.node.url,
        })),
    });
};
