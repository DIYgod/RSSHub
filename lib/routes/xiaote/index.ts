import type { Route } from '@/types';
import got from '@/utils/got'; // RSSHub HTTP client
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['bbs'],
    example: '/xiaote/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xiaote.com/'],
        },
    ],
    name: '首页帖子',
    maintainers: ['wxsimon'],
    handler,
    url: 'xiaote.com/',
};

async function handler() {
    const { data } = await got.post('https://lcen.xiaote.net//api/graphql/', {
        json: {
            query: /* GraphQL */ `
                query ($startCursor: Int) {
                    communities(startCursor: $startCursor) {
                        edges {
                            node {
                                objectId
                                content
                                createdAt
                                imageUrls
                                user {
                                    nickname
                                }
                            }
                        }
                    }
                }
            `,
        },
    });

    return {
        title: '小特社区',
        // Source webpage
        link: 'https://xiaote.com/',
        // Map the previously fetched entries
        item: data.data.communities.edges.map((node) => {
            const item = node.node;
            let description = item.content;
            if (item.imageUrls) {
                for (const url of item.imageUrls) {
                    description += `<img src="${url}">`;
                }
            }

            return {
                title: item.content,
                link: `https://www.xiaote.com/r/${item.objectId}`,
                description,
                pubDate: parseDate(item.createdAt * 1000),
                author: item.user.nickname,
            };
        }),
    };
}
