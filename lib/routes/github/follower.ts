// @ts-nocheck
import got from '@/utils/got';
import { config } from '@/config';

export default async (ctx) => {
    if (!config.github || !config.github.access_token) {
        throw new Error('GitHub follower RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const user = ctx.req.param('user');

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

    ctx.set('data', {
        allowEmpty: true,
        title: `${user}'s followers`,
        link: host,
        item: data.map((follower) => ({
            title: `${follower.node.login} started following ${user}`,
            author: follower.node.login,
            description: `<a href="https://github.com/${follower.node.login}">${follower.node.login}</a> <br> <img sytle="width:50px;" src='${follower.node.avatarUrl}'>`,
            link: `https://github.com/${follower.node.login}`,
        })),
    });
};
