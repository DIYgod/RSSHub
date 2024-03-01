const got = require('@/utils/got'); // 自订的 got
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { data } = await got.post('https://lcen.xiaote.net//api/graphql/', {
        json: {
            query: `query($startCursor: Int) {
                communities(startCursor: $startCursor) {
                    edges {
                        node {
                            objectId
                            content
                            createdAt
                            imageUrls
                            user{
                                nickname
                            }
                    }
                }
              }
            }`,
        },
    });

    ctx.state.data = {
        title: '小特社区',
        // 源链接
        link: 'https://xiaote.com/',
        // 遍历所有此前获取的数据
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
};
